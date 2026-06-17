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
    licensePlate: Joi.string(),
    color: Joi.string(),
    capacity: Joi.number().integer().min(1),
  }).min(1),
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
};