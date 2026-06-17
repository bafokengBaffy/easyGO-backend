const Joi = require('joi');

const bookRide = {
    body: Joi.object().keys({
        pickup_location: Joi.object().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).required(),
        dropoff_location: Joi.object().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
            address: Joi.string().optional()
        }).required(),
        ride_type: Joi.string().valid('standard', 'premium', 'van').default('standard'),
        promotion_code: Joi.string().alphanum().optional()
    }),
};

const updateRideStatus = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('accepted', 'arrived', 'picked_up', 'completed', 'cancelled').required(),
        location: Joi.object().keys({
            lat: Joi.number().required(),
            lng: Joi.number().required()
        }).optional()
    })
};

const getEstimate = {
    body: Joi.object().keys({
        pickup: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).required(),
        dropoff: Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        }).required(),
        vehicleType: Joi.string().optional(),
        seats: Joi.number().integer().min(1).optional()
    })
};

const cancelRide = {
    params: Joi.object().keys({
        id: Joi.string().required()
    }),
    body: Joi.object().keys({
        reason: Joi.string().required(),
        cancelledBy: Joi.string().valid('rider', 'driver', 'admin').default('rider')
    })
};

const getRideById = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

module.exports = {
    bookRide,
    updateRideStatus,
    getEstimate,
    cancelRide,
    getRideById
};