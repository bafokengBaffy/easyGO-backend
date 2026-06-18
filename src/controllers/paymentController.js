const mpesaService = require('../services/mpesa.service');
const ecocashService = require('../services/ecocash.service');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { Payment, Ride, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Production Payment Controller handling Lesotho Mobile Money
const noopResponse = (res, message = 'OK', data = null, status = 200) => {
  return res.status(status).json(new ApiResponse(status, data, message));
};
exports.list = asyncHandler(async (req, res, next) => {
  const { status, provider, ride_id, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const where = {};
  if (status) where.status = status;
  if (provider) where.provider = provider;
  if (ride_id) where.ride_id = ride_id;
  
  // If user is not admin, only show their own payments
  if (req.user.role !== 'admin') {
    const rides = await Ride.findAll({ 
      where: { rider_id: req.user.id },
      attributes: ['id']
    });
    const rideIds = rides.map(r => r.id);
    where.ride_id = { [Op.in]: rideIds };
  }
  
  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      { model: Ride, as: 'ride', attributes: ['id', 'pickup_address', 'dropoff_address', 'status'] }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset
  });
  
  return res.status(200).json(new ApiResponse(200, {
    payments: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Payments retrieved successfully'));
});

// Create a new payment (direct record)
exports.create = asyncHandler(async (req, res, next) => {
  const { ride_id, amount, provider, transaction_id, status = 'PENDING', payment_method } = req.body;
  
  // Verify the ride belongs to the user (if not admin)
  if (req.user.role !== 'admin') {
    const ride = await Ride.findOne({
      where: { id: ride_id, rider_id: req.user.id }
    });
    if (!ride) {
      throw new ApiError(404, 'Ride not found or unauthorized', 'RIDE_NOT_FOUND');
    }
  }
  
  const payment = await Payment.create({
    ride_id,
    amount,
    provider: provider || payment_method,
    transaction_id: transaction_id || `TXN-${Date.now()}`,
    status,
    user_id: req.user.id
  });
  
  logger.info(`Payment created: ${payment.id}`, { paymentId: payment.id, userId: req.user.id });
  
  return res.status(201).json(new ApiResponse(201, payment, 'Payment created successfully'));
});

// Get payment by ID
exports.getPaymentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const payment = await Payment.findByPk(id, {
    include: [
      { model: Ride, as: 'ride' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
    ]
  });
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }
  
  // Check authorization
  if (req.user.role !== 'admin' && payment.user_id !== req.user.id) {
    throw new ApiError(403, 'Unauthorized to view this payment', 'UNAUTHORIZED');
  }
  
  return res.status(200).json(new ApiResponse(200, payment, 'Payment retrieved successfully'));
});

// Update payment status
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
    throw new ApiError(400, 'Invalid status value', 'INVALID_STATUS');
  }
  
  const payment = await Payment.findByPk(id);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }
  
  await payment.update({ status });
  
  logger.info(`Payment status updated: ${id} to ${status}`);
  
  return res.status(200).json(new ApiResponse(200, payment, 'Payment status updated successfully'));
});

// Initiate mobile payment (M-Pesa or EcoCash)
exports.initiateMobilePayment = asyncHandler(async (req, res, next) => {
  const { provider, phoneNumber, amount, reference, ride_id } = req.body;
  let transactionId = `TXN-${Date.now()}`;
  const userId = req.user.id;

  // Validate required fields
  if (!provider || !phoneNumber || !amount) {
    throw new ApiError(400, 'Provider, phoneNumber and amount are required', 'MISSING_FIELDS');
  }

  let result;
  if (provider.toUpperCase() === 'MPESA') {
    result = await mpesaService.stkPush({
      phoneNumber,
      amount,
      accountReference: reference || 'EASYGO-TRIP',
      transactionDesc: `Payment for User ${userId}`,
      transactionId
    });
    // Use M-Pesa's CheckoutRequestID as the transaction identifier
    if (result.CheckoutRequestID) {
      transactionId = result.CheckoutRequestID;
    }
  } else if (provider.toUpperCase() === 'ECOCASH') {
    result = await ecocashService.initiatePayment({
      phoneNumber,
      amount,
      reference: reference || 'EASYGO-TRIP',
      description: `Payment for User ${userId}`,
      transactionId
    });
  } else {
    throw new ApiError(400, 'Invalid payment provider. Use MPESA or ECOCASH.', 'INVALID_PROVIDER');
  }

  // Record the payment in the database as PENDING
  const payment = await Payment.create({
    ride_id: ride_id || null,
    amount,
    provider: provider.toUpperCase(),
    status: 'PENDING',
    transaction_id: transactionId,
    user_id: userId,
    metadata: { phoneNumber, reference, result }
  });

  logger.info(`Mobile payment initiated: ${payment.id}`, { transactionId, provider, amount, userId });

  return res.status(200).json(new ApiResponse(200, { 
    paymentId: payment.id,
    transactionId, 
    provider,
    ...result 
  }, 'Payment initiation successful'));
});

/**
 * Process payment reversals/refunds
 */
exports.processRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const payment = await Payment.findByPk(id);
  if (!payment || payment.status !== 'COMPLETED') {
    throw new ApiError(400, 'Only completed payments can be refunded');
  }

  // Logic for gateway refund would go here (M-Pesa/EcoCash reversal)
  await payment.update({ status: 'REFUNDED', metadata: { ...payment.metadata, refundReason: reason } });
  
  return res.status(200).json(new ApiResponse(200, payment, 'Refund processed successfully'));
});

/**
 * Generate basic receipt data
 */
exports.generateReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, { include: ['ride'] });
  if (!payment) throw new ApiError(404, 'Payment not found');

  return res.status(200).json(new ApiResponse(200, {
    receiptNumber: `REC-${payment.transaction_id}`,
    date: payment.createdAt,
    amount: payment.amount,
    provider: payment.provider
  }));
});

/**
 * Aggregate payment statistics
 */
exports.getPaymentSummary = asyncHandler(async (req, res) => {
  const summary = await Payment.findAll({
    attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'], [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']],
    group: ['status']
  });
  return res.status(200).json(new ApiResponse(200, summary));
});

// Delete payment (admin only)
exports.deletePayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const payment = await Payment.findByPk(id);
  
  if (!payment) {
    throw new ApiError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }
  
  await payment.destroy();
  
  logger.info(`Payment deleted: ${id}`, { paymentId: id, userId: req.user.id });
  
  return res.status(200).json(new ApiResponse(200, null, 'Payment deleted successfully'));
});

// Wallet balance (minimal stub)
exports.getWalletBalance = asyncHandler(async (req, res) => {
  // In production, compute from user wallet model / ledger
  const balance = 0.0;
  return res.status(200).json(new ApiResponse(200, { balance, currency: 'USD' }, 'Wallet balance retrieved'));
});

// Top up wallet (minimal stub)
exports.topUpWallet = asyncHandler(async (req, res) => {
  const { amount, method, reference } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, 'Invalid top-up amount');

  // Record a payment entry for the top-up (PENDING)
  const payment = await Payment.create({
    ride_id: null,
    amount,
    provider: method || 'WALLET',
    status: 'PENDING',
    transaction_id: `TOPUP-${Date.now()}`,
    user_id: req.user.id,
    metadata: { reference }
  });

  return res.status(201).json(new ApiResponse(201, payment, 'Top-up initiated'));
});

// Withdraw from wallet (minimal stub)
exports.withdrawWallet = asyncHandler(async (req, res) => {
  const { amount, method, destination } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, 'Invalid withdraw amount');

  // Create a withdrawal record (PENDING)
  const withdrawal = await Payment.create({
    ride_id: null,
    amount,
    provider: method || 'BANK',
    status: 'PENDING',
    transaction_id: `WD-${Date.now()}`,
    user_id: req.user.id,
    metadata: { destination }
  });

  return res.status(200).json(new ApiResponse(200, withdrawal, 'Withdrawal request submitted'));
});

// Invoices listing (stub)
exports.getInvoices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const invoices = await Payment.findAll({ limit: parseInt(limit), offset: parseInt(offset), order: [['created_at', 'DESC']] });
  return res.status(200).json(new ApiResponse(200, { invoices }, 'Invoices retrieved'));
});

exports.getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await Payment.findByPk(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return res.status(200).json(new ApiResponse(200, invoice, 'Invoice retrieved'));
});

exports.downloadInvoice = asyncHandler(async (req, res) => {
  // Minimal: return invoice JSON. PDF generation not implemented here.
  const invoice = await Payment.findByPk(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return res.status(200).json(new ApiResponse(200, invoice, 'Invoice download (JSON)'));
});

// Payment methods (simple stubs)
exports.getPaymentMethods = asyncHandler(async (req, res) => {
  return noopResponse(res, 'Payment methods retrieved', []);
});

exports.addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, details, default: isDefault } = req.body;
  // Persisting payment methods is not implemented here; echo back
  return res.status(201).json(new ApiResponse(201, { type, details, default: !!isDefault }, 'Payment method added'));
});

exports.removePaymentMethod = asyncHandler(async (req, res) => {
  // Minimal removal stub
  return noopResponse(res, 'Payment method removed');
});

// Stripe webhook stub
exports.stripeWebhook = asyncHandler(async (req, res) => {
  // raw body is expected; simply acknowledge
  logger.info('Received Stripe webhook', { headers: req.headers });
  return res.status(200).send('ok');
});

// Payment statistics / insights
exports.getPaymentStatistics = asyncHandler(async (req, res) => {
  // Minimal aggregated stats
  const totalPayments = await Payment.count();
  const totalAmount = (await Payment.sum('amount')) || 0;
  return res.status(200).json(new ApiResponse(200, { totalPayments, totalAmount }, 'Payment statistics'));
});