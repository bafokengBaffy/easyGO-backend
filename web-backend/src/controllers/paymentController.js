const paymentService = require('../services/paymentService');
const { ok } = require('../utils/apiResponse');

exports.create = async (req, res, next) => {
  try {
    return ok(res, await paymentService.createPayment(req.body), 'Payment recorded.', 201);
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    return ok(res, await paymentService.listPayments(), 'Payments fetched.');
  } catch (e) {
    return next(e);
  }
};
