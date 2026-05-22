const rideService = require('../services/rideService');
const { ok } = require('../utils/apiResponse');

exports.create = async (req, res, next) => {
  try {
    const ride = await rideService.createRide({ ...req.body, rider_id: req.user?.id || req.body.rider_id });
    return ok(res, ride, 'Ride created.', 201);
  } catch (error) {
    return next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    return ok(res, await rideService.listRides(), 'Rides fetched.');
  } catch (error) {
    return next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    return ok(res, await rideService.updateRideStatus(req.params.id, req.body.status), 'Ride status updated.');
  } catch (error) {
    return next(error);
  }
};
