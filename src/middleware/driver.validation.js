const Joi = require('joi');

const updateStatus = {
  body: Joi.object().keys({
    status: Joi.string().valid('online', 'offline', 'busy').required(),
    location: Joi.object().keys({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }),
  }),
};

const updateVehicle = {
  body: Joi.object().keys({
    make: Joi.string(),
    model: Joi.string(),
    year: Joi.string(),
    plate_number: Joi.string(),
    color: Joi.string(),
    capacity: Joi.number().integer().min(1),
  }).min(1),
};

const cancelRide = {
  params: Joi.object().keys({
    rideId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    reason: Joi.string().allow('', null)
  }).optional(),
};

const getCurrentRide = {
  // no params
};

const getAvailableRides = {
  query: Joi.object().keys({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    radius: Joi.number().optional(),
    limit: Joi.number().optional()
  })
};

const getMatchingSuggestions = {
  body: Joi.object().keys({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    radius: Joi.number().optional(),
    preference: Joi.string().optional()
  })
};

const getEarningsDetails = {
  query: Joi.object().keys({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
};

const getPayoutHistory = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    status: Joi.string().optional()
  })
};

const getReviews = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional()
  })
};

const uploadDocuments = {
  // multer handles files
};

const deleteDocument = {
  params: Joi.object().keys({ id: Joi.string().required() })
};

const getNotifications = {
  query: Joi.object().keys({ unreadOnly: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true','false')).optional() })
};

const markNotificationRead = {
  params: Joi.object().keys({ id: Joi.string().required() })
};

const updateSettings = {
  body: Joi.object().keys({
    notificationPreferences: Joi.object().optional(),
    ridePreferences: Joi.object().optional(),
    privacySettings: Joi.object().optional()
  }).min(1)
};

const checkGeofence = {
  query: Joi.object().keys({ latitude: Joi.number().required(), longitude: Joi.number().required(), zoneId: Joi.string().optional() })
};

const getStatus = {
  // no params
};

const getVehicle = {
  // no params
};

const getFleetInfo = {
  // no params
};

const acceptRide = {
  params: Joi.object().keys({
    rideId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    location: Joi.object().keys({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }),
  }),
};

const completeRide = {
  params: Joi.object().keys({
    rideId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    distance: Joi.number().required(),
    duration: Joi.number().required(),
  }),
};

module.exports = {
  updateStatus,
  updateVehicle,
  acceptRide,
  completeRide,
  cancelRide,
  getCurrentRide,
  getAvailableRides,
  getMatchingSuggestions,
  getEarningsDetails,
  getPayoutHistory,
  getReviews,
  uploadDocuments,
  deleteDocument,
  getNotifications,
  markNotificationRead,
  updateSettings,
  checkGeofence,
  getStatus,
  getVehicle,
  getFleetInfo,
};