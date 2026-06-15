/**
 * Mobile Money Controller
 * Handles M-Pesa and EcoCash payment endpoints
 * @module controllers/mobileMoneyController
 */

const mpesaService = require('../services/mpesa.service');
const ecocashService = require('../services/ecocash.service');
const logger = require('../utils/logger');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const { MobileMoneyTransaction } = require('../models');
const { Op } = require('sequelize');

class MobileMoneyController {
  /**
   * Initiate M-Pesa STK Push payment
   */
  initiateMpesaPayment = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const {
      phoneNumber,
      amount,
      accountReference,
      description,
      metadata = {}
    } = req.body;

    const transactionId = this.generateTransactionId('MPESA');
    
    logger.info(`Initiating M-Pesa payment`, {
      transactionId,
      phoneNumber,
      amount,
      userId: req.user?.id
    });

    const result = await mpesaService.stkPush({
      phoneNumber,
      amount,
      accountReference: accountReference || `EASYGO-${Date.now()}`,
      transactionDesc: description || 'EasyGo Payment',
      transactionId,
      callbackUrl: metadata.callbackUrl
    });

    return res.status(200).json(new ApiResponse(200, {
      transactionId,
      ...result,
      provider: 'MPESA'
    }, 'M-Pesa payment initiated successfully'));
  });

  /**
   * Initiate EcoCash payment
   */
  initiateEcoCashPayment = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const {
      phoneNumber,
      amount,
      reference,
      description,
      currency = 'LSL',
      language = 'EN',
      metadata = {}
    } = req.body;

    const transactionId = this.generateTransactionId('ECOCASH');
    
    logger.info(`Initiating EcoCash payment`, {
      transactionId,
      phoneNumber,
      amount,
      userId: req.user?.id
    });

    const result = await ecocashService.initiatePayment({
      phoneNumber,
      amount,
      currency,
      reference: reference || `EASYGO-${Date.now()}`,
      description: description || 'EasyGo Payment',
      transactionId,
      language,
      callbackUrl: metadata.callbackUrl
    });

    return res.status(200).json(new ApiResponse(200, {
      transactionId,
      ...result,
      provider: 'ECOCASH'
    }, 'EcoCash payment initiated successfully'));
  });

  /**
   * Query payment status
   */
  queryPaymentStatus = asyncHandler(async (req, res, next) => {
    const { transactionId, provider } = req.params;
    
    if (!transactionId || !provider) {
      throw new ApiError(400, 'Transaction ID and provider are required', 'MISSING_PARAMS');
    }

    if (!['MPESA', 'ECOCASH'].includes(provider.toUpperCase())) {
      throw new ApiError(400, 'Invalid provider', 'INVALID_PROVIDER');
    }

    let result;
    
    if (provider.toUpperCase() === 'MPESA') {
      // Need to get checkoutRequestId from database first
      const transaction = await MobileMoneyTransaction.findOne({
        where: { transactionId }
      });
      
      if (!transaction || !transaction.providerTransactionId) {
        throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
      }
      
      result = await mpesaService.queryStkStatus(
        transaction.providerTransactionId,
        transactionId
      );
    } else {
      const transaction = await MobileMoneyTransaction.findOne({
        where: { transactionId }
      });
      
      if (!transaction || !transaction.providerTransactionId) {
        throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
      }
      
      result = await ecocashService.queryPayment(
        transaction.providerTransactionId,
        transactionId
      );
    }

    return res.status(200).json(new ApiResponse(200, result, 'Payment status retrieved'));
  });

  /**
   * Process M-Pesa B2C payout
   */
  processMpesaPayout = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const {
      phoneNumber,
      amount,
      commandId = 'BusinessPayment',
      remarks,
      occasion
    } = req.body;

    // Check admin permission
    if (req.user?.role !== 'admin' && req.user?.role !== 'finance') {
      throw new ApiError(403, 'Unauthorized for payout operations', 'UNAUTHORIZED');
    }

    const transactionId = this.generateTransactionId('MPESA_B2C');
    
    const result = await mpesaService.b2cPayment({
      phoneNumber,
      amount,
      commandId,
      remarks: remarks || 'EasyGo Payout',
      occasion,
      transactionId
    });

    return res.status(200).json(new ApiResponse(200, {
      transactionId,
      ...result,
      provider: 'MPESA',
      type: 'B2C'
    }, 'Payout initiated successfully'));
  });

  /**
   * Reverse a transaction
   */
  reverseTransaction = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors.array());
    }

    const { transactionId, reason } = req.body;
    
    // Check admin permission
    if (req.user?.role !== 'admin' && req.user?.role !== 'finance') {
      throw new ApiError(403, 'Unauthorized for reversal operations', 'UNAUTHORIZED');
    }

    const originalTransaction = await MobileMoneyTransaction.findOne({
      where: { transactionId }
    });

    if (!originalTransaction) {
      throw new ApiError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    if (originalTransaction.status !== 'COMPLETED') {
      throw new ApiError(400, 'Only completed transactions can be reversed', 'INVALID_STATUS');
    }

    let result;
    const reversalTransactionId = this.generateTransactionId('REVERSAL');

    if (originalTransaction.provider === 'MPESA') {
      result = await mpesaService.reverseTransaction({
        transactionId: originalTransaction.providerTransactionId,
        amount: originalTransaction.amount,
        receiverParty: originalTransaction.phoneNumber,
        remarks: reason,
        occasion: `Reversal of ${transactionId}`
      });
    } else {
      result = await ecocashService.reversePayment({
        providerTransactionId: originalTransaction.providerTransactionId,
        amount: originalTransaction.amount,
        reason,
        transactionId: reversalTransactionId
      });
    }

    return res.status(200).json(new ApiResponse(200, {
      originalTransactionId: transactionId,
      reversalTransactionId,
      ...result
    }, 'Reversal initiated successfully'));
  });

  /**
   * Get transaction history
   */
  getTransactionHistory = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, status, provider, startDate, endDate } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // If not admin, only show user's transactions
    if (req.user?.role !== 'admin') {
      where.userId = req.user?.id;
    }
    
    const transactions = await MobileMoneyTransaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(new ApiResponse(200, {
      transactions: transactions.rows,
      total: transactions.count,
      page: parseInt(page),
      totalPages: Math.ceil(transactions.count / parseInt(limit))
    }, 'Transaction history retrieved'));
  });

  /**
   * Generate unique transaction ID
   */
  generateTransactionId(prefix) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }
}

module.exports = new MobileMoneyController();