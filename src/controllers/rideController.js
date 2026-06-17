const rideService = require('../services/rideService');
const pricingService = require('../services/pricingService');
const fraudDetectionService = require('../services/fraudDetection.service');
const trackingService = require('../services/trackingService');
const { ok } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const ride = await rideService.create({ 
    ...req.body, 
    rider_id: req.user.id 
  });
  return ok(res, ride, 'Ride created.', 201);
});

exports.instantBook = asyncHandler(async (req, res) => {
  // 1. Check for fraud/suspicious behavior
  const fraudCheck = await fraudDetectionService.analyzeRideRequest(req.user.id, req.body);
  if (!fraudCheck.isAllowed) {
    return res.status(403).json({ success: false, message: 'Request flagged as high risk' });
  }

  const ride = await rideService.create({ 
    ...req.body, 
    rider_id: req.user.id,
    status: 'searching'
  });
  return ok(res, ride, 'Instant booking initiated.', 201);
});

exports.getEstimate = asyncHandler(async (req, res) => {
  const estimate = await pricingService.calculateFare(req.body);
  return ok(res, estimate, 'Estimate calculated.');
});

exports.getRideById = asyncHandler(async (req, res) => {
  const ride = await rideService.getById(req.params.id);
  return ok(res, ride, 'Ride details fetched.');
});

exports.getRideHistory = asyncHandler(async (req, res) => {
  const history = await rideService.getRiderHistory(req.user.id);
  return ok(res, history, 'Ride history fetched.');
});

exports.updateRideStatus = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(req.params.id, req.body.status);
  return ok(res, ride, 'Ride status updated.');
});

exports.acceptRide = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(req.params.id, 'accepted');
  // Note: driver_id update should be handled in service
  return ok(res, ride, 'Ride accepted.');
});

exports.arriveRide = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(req.params.id, 'arrived');
  return ok(res, ride, 'Driver arrived.');
});

exports.startRide = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(req.params.id, 'picked_up');
  return ok(res, ride, 'Ride started.');
});

exports.cancelRide = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(req.params.id, 'cancelled');
  return ok(res, ride, 'Ride cancelled.');
});

exports.completeRide = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRideStatus(req.params.id, 'completed');
  return ok(res, ride, 'Ride completed.');
});

exports.getTrackingInfo = asyncHandler(async (req, res) => {
  const tracking = await trackingService.getDriverLocation(req.params.id);
  return ok(res, tracking, 'Tracking info fetched.');
});
