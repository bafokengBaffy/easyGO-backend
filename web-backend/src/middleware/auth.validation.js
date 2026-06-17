const Joi = require('joi');

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8),
        name: Joi.string().required(),
        phone: Joi.string().required(),
        role: Joi.string().valid('rider', 'driver', 'admin').default('rider'),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

module.exports = {
    register,
    login,
};