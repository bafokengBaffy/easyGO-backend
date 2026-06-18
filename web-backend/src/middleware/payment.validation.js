const Joi = require('joi');

const getPaymentHistory = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    status: Joi.string().optional(),
    type: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
};

const getPaymentById = {
  params: Joi.object().keys({ id: Joi.string().required() })
};

const createPayment = {
  body: Joi.object().keys({
    rideId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).optional(),
    method: Joi.string().required(),
    description: Joi.string().optional(),
    metadata: Joi.object().optional()
  })
};

const updatePaymentStatus = {
  params: Joi.object().keys({ id: Joi.string().required() }),
  body: Joi.object().keys({ status: Joi.string().required(), reason: Joi.string().optional() })
};

const deletePayment = {
  params: Joi.object().keys({ id: Joi.string().required() }),
  body: Joi.object().keys({ reason: Joi.string().optional() }).optional()
};

const initiateMobilePayment = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
    provider: Joi.string().required(),
    rideId: Joi.string().optional(),
    reference: Joi.string().optional(),
    accountReference: Joi.string().optional(),
    description: Joi.string().optional(),
    metadata: Joi.object().optional()
  })
};

module.exports = {
  getPaymentHistory,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  initiateMobilePayment
};
