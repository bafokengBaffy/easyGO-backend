const driverService = require('../services/driverService');
const { ok } = require('../utils/apiResponse');

exports.list = async (req, res, next) => {
  try {
    return ok(res, await driverService.listDrivers(), 'Drivers fetched.');
  } catch (e) {
    return next(e);
  }
};

exports.setOnlineStatus = async (req, res, next) => {
  try {
    const driver = await driverService.updateOnlineStatus(req.params.id, req.body.is_online);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    return ok(res, driver, 'Driver status updated.');
  } catch (e) {
    return next(e);
  }
};
