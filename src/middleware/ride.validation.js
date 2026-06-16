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

module.exports = {
    bookRide
};