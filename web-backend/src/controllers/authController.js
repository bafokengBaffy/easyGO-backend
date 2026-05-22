const authService = require('../services/authService');
const { ok } = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return ok(res, data, 'Registered successfully.', 201);
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return ok(res, data, 'Login successful.');
  } catch (error) {
    return next(error);
  }
};
