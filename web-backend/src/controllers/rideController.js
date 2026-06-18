const rideService = require('../services/rideService');
const pricingService = require('../services/pricingService');
const fraudDetectionService = require('../services/fraudDetection.service');
const trackingService = require('../services/trackingService');
const paymentService = require('../services/paymentService');
const reviewService = require('../services/reviewService');
const promotionService = require('../services/promotionService');
const analyticsService = require('../services/analyticsService');
const { Payment, Review } = require('../models');
const { ApiError } = require('../utils/apiError');
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

exports.getRouteDetails = asyncHandler(async (req, res) => {
  const route = await rideService.getRouteDetails(req.params.id);
  return ok(res, route, 'Route details fetched.');
});

exports.getPaymentDetails = asyncHandler(async (req, res) => {
  const ride = await rideService.getById(req.params.id);

  if (req.user.role !== 'admin' && ride.rider_id !== req.user.id && ride.driver_id !== req.user.id) {
    throw new ApiError(403, 'Unauthorized to view payment details', 'UNAUTHORIZED');
  }

  const payments = await Payment.findAll({ where: { ride_id: ride.id } });
  return ok(res, { ride, payments }, 'Payment details fetched.');
});

exports.processPayment = asyncHandler(async (req, res) => {
  const ride = await rideService.getById(req.params.id);

  if (req.user.role !== 'admin' && ride.rider_id !== req.user.id) {
    throw new ApiError(403, 'Unauthorized to process payment for this ride', 'UNAUTHORIZED');
  }

  const { paymentMethod, amount, tip = 0 } = req.body;
  const totalAmount = parseFloat(amount || ride.fare_amount || 0) + parseFloat(tip || 0);

  const payment = await paymentService.createPayment({
    ride_id: ride.id,
    user_id: req.user.id,
    amount: totalAmount,
    provider: paymentMethod || 'wallet',
    transaction_id: `TXN-${Date.now()}`,
    status: 'COMPLETED'
  });

  return ok(res, payment, 'Payment processed successfully.');
});

exports.rateRide = asyncHandler(async (req, res) => {
  const ride = await rideService.getById(req.params.id);
  const { rating, review, target = 'driver' } = req.body;
  const revieweeId = target === 'rider' ? ride.rider_id : ride.driver_id;

  if (!revieweeId) {
    throw new ApiError(400, 'Review target not found', 'INVALID_REQUEST');
  }

  const createdReview = await Review.create({
    ride_id: ride.id,
    reviewer_id: req.user.id,
    reviewee_id: revieweeId,
    rating,
    comment: review || null
  });

  return ok(res, createdReview, 'Ride rated successfully.', 201);
});

exports.getRideReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({ where: { ride_id: req.params.id } });
  return ok(res, reviews, 'Ride reviews fetched.');
});

exports.createRecurringRide = asyncHandler(async (req, res) => {
  const schedule = {
    id: `sched_${Date.now()}`,
    ...req.body,
    status: 'active',
    created_at: new Date().toISOString()
  };
  return ok(res, schedule, 'Recurring ride created.', 201);
});

exports.getRecurringRides = asyncHandler(async (req, res) => {
  return ok(res, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    total: 0,
    data: []
  }, 'Recurring rides fetched.');
});

exports.updateRecurringRide = asyncHandler(async (req, res) => {
  return ok(res, {
    scheduleId: req.params.scheduleId,
    ...req.body,
    updated_at: new Date().toISOString()
  }, 'Recurring ride updated.');
});

exports.cancelRecurringRide = asyncHandler(async (req, res) => {
  return ok(res, {
    scheduleId: req.params.scheduleId,
    status: 'cancelled'
  }, 'Recurring ride cancelled.');
});

exports.getAvailablePromotions = asyncHandler(async (req, res) => {
  const promotions = await promotionService.listPromotions();
  return ok(res, promotions, 'Available promotions fetched.');
});

exports.applyPromotion = asyncHandler(async (req, res) => {
  const promo = await promotionService.validatePromotion(req.body.code);
  if (!promo) {
    throw new ApiError(404, 'Promotion code not found or inactive', 'PROMO_NOT_FOUND');
  }

  return ok(res, { promotion: promo }, 'Promotion applied successfully.');
});

exports.getRideStatistics = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getRideAnalytics(req.query);
  return ok(res, stats, 'Ride statistics fetched.');
});
