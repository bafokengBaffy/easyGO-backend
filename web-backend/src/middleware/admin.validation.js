const Joi = require('joi');

/**
 * Admin Validation Schemas
 */
const adminValidation = {
  // User Management
  getUserById: {
    params: Joi.object().keys({
      id: Joi.string().required()
    })
  },

  updateUserByAdmin: {
    params: Joi.object().keys({
      id: Joi.string().required()
    }),
    body: Joi.object().keys({
      name: Joi.string(),
      email: Joi.string().email(),
      role: Joi.string().valid('user', 'driver', 'admin'),
      status: Joi.string().valid('active', 'suspended', 'pending'),
      metadata: Joi.object()
    }).min(1)
  },

  deleteUser: {
    params: Joi.object().keys({
      id: Joi.string().required()
    }),
    body: Joi.object().keys({
      reason: Joi.string().required()
    })
  },

  // Driver Management
  getDriverById: {
    params: Joi.object().keys({
      id: Joi.string().required()
    })
  },

  updateDriverStatus: {
    params: Joi.object().keys({
      id: Joi.string().required()
    }),
    body: Joi.object().keys({
      status: Joi.string().valid('online', 'offline', 'suspended').required(),
      reason: Joi.string().when('status', {
        is: 'suspended',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  },

  verifyDriver: {
    params: Joi.object().keys({
      id: Joi.string().required()
    }),
    body: Joi.object().keys({
      status: Joi.string().valid('verified', 'rejected').required(),
      reason: Joi.string().when('status', {
        is: 'rejected',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  },

  getDriverPerformance: {
    params: Joi.object().keys({
      id: Joi.string().required()
    }),
    query: Joi.object().keys({
      period: Joi.string().valid('day', 'week', 'month', 'year').default('month')
    })
  }
};

module.exports = { adminValidation };