const userService = require('../services/userService');
const { ok } = require('../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
  try {
    const id = req.user?.id || req.query.userId;
    const profile = await userService.getUserById(id);
    return ok(res, profile, 'Profile fetched.');
  } catch (error) {
    return next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    return ok(res, users, 'Users fetched.');
  } catch (error) {
    return next(error);
  }
};
