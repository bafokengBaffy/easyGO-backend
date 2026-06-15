const mpesaService = require('../services/mpesa.service');
const ecocashService = require('../services/ecocash.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const { BadRequestException } = require('../exceptions/api.exception');

/**
 * Production Payment Controller handling Lesotho Mobile Money
 */
exports.initiateMobilePayment = asyncHandler(async (req, res) => {
  const { provider, phoneNumber, amount, reference } = req.body;
  const transactionId = `TXN-${Date.now()}`;
  const userId = req.user.id;

  let result;
  if (provider === 'MPESA') {
    result = await mpesaService.stkPush({
      phoneNumber,
      amount,
      accountReference: reference || 'EASYGO-TRIP',
      transactionDesc: `Payment for User ${userId}`,
      transactionId
    });
  } else if (provider === 'ECOCASH') {
    result = await ecocashService.initiatePayment({
      phoneNumber,
      amount,
      reference: reference || 'EASYGO-TRIP',
      description: `Payment for User ${userId}`,
      transactionId
    });
  } else {
    throw new BadRequestException('Invalid payment provider. Use MPESA or ECOCASH.');
  }

  return sendResponse(res, 200, { transactionId, ...result }, 'Payment initiation successful');
});

exports.checkStatus = asyncHandler(async (req, res) => {
  const { provider, transactionId, providerTransactionId } = req.query;

  let status;
  if (provider === 'MPESA') {
    status = await mpesaService.queryStkStatus(providerTransactionId, transactionId);
  } else if (provider === 'ECOCASH') {
    status = await ecocashService.queryPayment(providerTransactionId, transactionId);
  } else {
    throw new BadRequestException('Invalid payment provider');
  }

  return sendResponse(res, 200, status, 'Transaction status retrieved');
});
