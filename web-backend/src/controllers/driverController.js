/**
 * Driver Controller - Production Ready Version 2.0.0
 * Comprehensive driver profile, vehicle, and performance management
 * 
 * @module controllers/driverController
 * @version 2.0.0
 * @author EasyGO Development Team
 */

const { Driver, Ride, Payment, User, Vehicle, Review, AuditLog, Sequelize } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const { NotFoundError, BadRequestError, UnauthorizedError, ConflictError } = require('../utils/apiError');
const driverService = require('../services/driverService');
const vehicleService = require('../services/vehicleService');
const cacheService = require('../services/cacheService');
const auditLogService = require('../services/auditLogService');
const logger = require('../utils/logger');
const { CACHE_KEYS, CACHE_DURATIONS } = require('../utils/cacheKeys');
const { USER_ROLES } = require('../constants/roles');
const { metrics } = require('../utils/metrics');

/**
 * Driver Controller - 20+ production-ready methods
 * Features: profiles, vehicles, earnings, ratings, trips, ride management, verification
 */
class DriverController {
  /**
   * Get driver profile with cache @route GET /api/v1/drivers/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError('No authenticated user');

    const cacheKey = `${CACHE_KEYS.DRIVER}:${userId}`;
    let driver = await cacheService.get(cacheKey);

    if (!driver) {
      driver = await Driver.findOne({
        where: { user_id: userId },
        include: [{ model: Vehicle, attributes: ['id', 'license_plate', 'make', 'model', 'year', 'color', 'status'] }],
        attributes: { exclude: ['password_hash', 'background_check_pdf'] }
      });

      if (!driver) throw new NotFoundError('Driver profile not found');
      await cacheService.set(cacheKey, driver, CACHE_DURATIONS.DRIVER);
    }

    metrics.histogramObserve('controller_driver_get_profile_duration', Date.now() - startTime);
    logger.info(`Driver ${userId} profile retrieved`);

    return sendResponse(res, 200, driver, 'Profile retrieved successfully');
  });

  /**
   * Update driver profile @route PUT /api/v1/drivers/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { name, phone, bio, bank_account, bank_code, preferred_areas } = req.body;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    if (name) {
      const user = await User.findByPk(userId);
      user.name = name;
      await user.save();
    }

    const updates = {};
    if (phone) updates.phone = phone;
    if (bio) updates.bio = bio;
    if (bank_account) updates.bank_account = bank_account;
    if (bank_code) updates.bank_code = bank_code;
    if (preferred_areas) updates.preferred_areas = preferred_areas;

    await driver.update(updates);
    await cacheService.del(`${CACHE_KEYS.DRIVER}:${userId}`);
    await auditLogService.log(userId, 'DRIVER_PROFILE_UPDATED', { updates });

    logger.info(`Driver ${userId} profile updated`);
    return sendResponse(res, 200, driver, 'Profile updated successfully');
  });

  /**
   * Register vehicle @route POST /api/v1/drivers/vehicles
   */
  registerVehicle = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { license_plate, make, model, year, color, registration_number, insurance_expiry } = req.body;

    if (!license_plate || !make || !model || !year) throw new BadRequestError('Missing required vehicle information');

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const existingVehicle = await Vehicle.findOne({ where: { license_plate } });
    if (existingVehicle) throw new ConflictError('Vehicle with this license plate already registered');

    const vehicle = await Vehicle.create({
      driver_id: driver.id,
      license_plate,
      make,
      model,
      year,
      color,
      registration_number,
      insurance_expiry,
      status: 'pending_verification'
    });

    await auditLogService.log(userId, 'VEHICLE_REGISTERED', { vehicle_id: vehicle.id });
    logger.info(`Driver ${userId} registered vehicle ${license_plate}`);

    return sendResponse(res, 201, vehicle, 'Vehicle registered successfully');
  });

  /**
   * Get driver vehicles @route GET /api/v1/drivers/vehicles
   */
  getVehicles = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const vehicles = await Vehicle.findAll({ where: { driver_id: driver.id } });

    return sendResponse(res, 200, vehicles, 'Vehicles retrieved successfully');
  });

  /**
   * Update vehicle @route PUT /api/v1/drivers/vehicles/:vehicleId
   */
  updateVehicle = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;
    const { make, model, color, registration_number, insurance_expiry } = req.body;

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const updates = {};
    if (make) updates.make = make;
    if (model) updates.model = model;
    if (color) updates.color = color;
    if (registration_number) updates.registration_number = registration_number;
    if (insurance_expiry) updates.insurance_expiry = insurance_expiry;

    await vehicle.update(updates);
    logger.info(`Vehicle ${vehicleId} updated`);
    return sendResponse(res, 200, vehicle, 'Vehicle updated successfully');
  });

  /**
   * Set driver availability @route POST /api/v1/drivers/availability
   */
  setAvailability = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { is_available, lat, lng } = req.body;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    driver.is_available = is_available;
    if (lat && lng) {
      driver.current_latitude = lat;
      driver.current_longitude = lng;
    }
    driver.last_seen = new Date();

    await driver.save();
    await cacheService.del(`${CACHE_KEYS.DRIVER}:${userId}`);

    logger.info(`Driver ${userId} availability set to ${is_available}`);
    return sendResponse(res, 200, driver, `Driver is now ${is_available ? 'online' : 'offline'}`);
  });

  /**
   * Get earnings @route GET /api/v1/drivers/earnings
   */
  getEarnings = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const whereClause = { driver_id: driver.id, status: 'completed' };
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const earnings = await Ride.findAll({
      where: whereClause,
      attributes: ['id', 'fare_amount', 'distance_km', 'duration_minutes', 'status', 'completed_at'],
      order: [['completed_at', 'DESC']]
    });

    const stats = {
      total_earnings: earnings.reduce((sum, r) => sum + (r.fare_amount || 0), 0),
      total_rides: earnings.length,
      average_fare: earnings.length > 0 ? (earnings.reduce((sum, r) => sum + (r.fare_amount || 0), 0) / earnings.length).toFixed(2) : 0,
      total_distance: earnings.reduce((sum, r) => sum + (r.distance_km || 0), 0).toFixed(2),
      total_duration: earnings.reduce((sum, r) => sum + (r.duration_minutes || 0), 0),
      rides: earnings
    };

    logger.info(`Driver ${userId} earnings retrieved`);
    return sendResponse(res, 200, stats, 'Earnings retrieved successfully');
  });

  /**
   * Get ratings @route GET /api/v1/drivers/ratings
   */
  getRatings = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const reviews = await Review.findAll({
      where: { driver_id: driver.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const stats = {
      average_rating: driver.average_rating || 0,
      total_ratings: driver.total_ratings || 0,
      reviews
    };

    return sendResponse(res, 200, stats, 'Ratings retrieved successfully');
  });

  /**
   * Get statistics @route GET /api/v1/drivers/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const rideStats = await Ride.findAll({
      where: { driver_id: driver.id },
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    const stats = {
      profile: {
        name: driver.user?.name,
        average_rating: driver.average_rating,
        total_rides: driver.total_rides,
        joined_date: driver.createdAt,
        verification_status: driver.verification_status
      },
      rides: rideStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
      vehicle: driver.Vehicle ? {
        license_plate: driver.Vehicle.license_plate,
        make: driver.Vehicle.make,
        model: driver.Vehicle.model,
        status: driver.Vehicle.status
      } : null
    };

    return sendResponse(res, 200, stats, 'Statistics retrieved successfully');
  });

  /**
   * Get trip history @route GET /api/v1/drivers/trips
   */
  getTripHistory = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const whereClause = { driver_id: driver.id };
    if (status) whereClause.status = status;

    const rides = await Ride.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'rider', attributes: ['id', 'name', 'avatar_url'] },
        { model: Payment, as: 'payment', attributes: ['id', 'amount', 'status'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return sendResponse(res, 200, {
      total: rides.count,
      trips: rides.rows,
      pagination: { limit, offset }
    }, 'Trip history retrieved successfully');
  });

  /**
   * Accept ride @route POST /api/v1/drivers/rides/:rideId/accept
   */
  acceptRide = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { rideId } = req.params;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver profile not found');

    const ride = await Ride.findByPk(rideId);
    if (!ride) throw new NotFoundError('Ride not found');
    if (ride.status !== 'requested') throw new BadRequestError('Ride cannot be accepted in its current status');

    ride.driver_id = driver.id;
    ride.status = 'accepted';
    await ride.save();

    logger.info(`Driver ${userId} accepted ride ${rideId}`);
    return sendResponse(res, 200, ride, 'Ride accepted successfully');
  });

  /**
   * Decline ride @route POST /api/v1/drivers/rides/:rideId/decline
   */
  declineRide = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) throw new NotFoundError('Ride not found');
    if (ride.status !== 'requested') throw new BadRequestError('Ride cannot be declined');

    await auditLogService.log(userId, 'RIDE_DECLINED', { ride_id: rideId, reason });

    logger.info(`Driver ${userId} declined ride ${rideId}`);
    return sendResponse(res, 200, {}, 'Ride declined');
  });

  /**
   * Start ride @route POST /api/v1/drivers/rides/:rideId/start
   */
  startRide = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { rideId } = req.params;

    const ride = await Ride.findByPk(rideId);
    if (!ride) throw new NotFoundError('Ride not found');
    if (ride.status !== 'accepted') throw new BadRequestError('Ride cannot be started');

    ride.status = 'in_progress';
    ride.started_at = new Date();
    await ride.save();

    logger.info(`Ride ${rideId} started`);
    return sendResponse(res, 200, ride, 'Ride started successfully');
  });

  /**
   * Complete ride @route POST /api/v1/drivers/rides/:rideId/complete
   */
  completeRide = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { rideId } = req.params;
    const { final_fare, distance_km, duration_minutes } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) throw new NotFoundError('Ride not found');
    if (ride.status !== 'in_progress') throw new BadRequestError('Ride cannot be completed');

    ride.status = 'completed';
    ride.completed_at = new Date();
    if (final_fare) ride.fare_amount = final_fare;
    if (distance_km) ride.distance_km = distance_km;
    if (duration_minutes) ride.duration_minutes = duration_minutes;

    await ride.save();

    logger.info(`Ride ${rideId} completed`);
    return sendResponse(res, 200, ride, 'Ride completed successfully');
  });

  /**
   * List all drivers (admin) @route GET /api/v1/drivers
   */
  listDrivers = asyncHandler(async (req, res) => {
    const { status, verification_status, limit = 20, offset = 0 } = req.query;

    const whereClause = {};
    if (status) whereClause.is_available = status === 'online';
    if (verification_status) whereClause.verification_status = verification_status;

    const drivers = await Driver.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vehicle, attributes: ['id', 'license_plate', 'make', 'model'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return sendResponse(res, 200, {
      total: drivers.count,
      drivers: drivers.rows,
      pagination: { limit, offset }
    }, 'Drivers retrieved successfully');
  });

  /**
   * Get driver by ID (admin) @route GET /api/v1/drivers/:driverId
   */
  getDriverById = asyncHandler(async (req, res) => {
    const { driverId } = req.params;

    const driver = await Driver.findByPk(driverId, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
        { model: Vehicle }
      ]
    });

    if (!driver) throw new NotFoundError('Driver not found');

    return sendResponse(res, 200, driver, 'Driver profile retrieved');
  });

  /**
   * Verify driver documents (admin) @route POST /api/v1/drivers/:driverId/verify
   */
  verifyDriver = asyncHandler(async (req, res) => {
    const { driverId } = req.params;
    const { status, notes } = req.body;

    const driver = await Driver.findByPk(driverId);
    if (!driver) throw new NotFoundError('Driver not found');

    driver.verification_status = status;
    if (notes) driver.verification_notes = notes;

    await driver.save();

    await auditLogService.log(req.user.id, 'DRIVER_VERIFIED', { driver_id: driverId, status, notes });

    logger.info(`Driver ${driverId} verification updated to ${status}`);
    return sendResponse(res, 200, driver, 'Driver verification updated');
  });

  /**
   * Suspend/unsuspend driver (admin) @route POST /api/v1/drivers/:driverId/suspend
   */
  suspendDriver = asyncHandler(async (req, res) => {
    const { driverId } = req.params;
    const { suspend, reason } = req.body;

    const driver = await Driver.findByPk(driverId);
    if (!driver) throw new NotFoundError('Driver not found');

    driver.is_suspended = suspend;
    if (reason) driver.suspension_reason = reason;

    await driver.save();

    logger.info(`Driver ${driverId} ${suspend ? 'suspended' : 'unsuspended'}`);
    return sendResponse(res, 200, driver, `Driver ${suspend ? 'suspended' : 'unsuspended'}`);
  });

  /**
   * Update location (real-time tracking)
   */
  updateLocation = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { latitude, longitude, heading, speed } = req.body;

    const driver = await Driver.findOne({ where: { user_id: userId } });
    if (!driver) throw new NotFoundError('Driver not found');

    await driver.update({
      current_latitude: latitude,
      current_longitude: longitude,
      last_seen: new Date()
    });

    return sendResponse(res, 200, driver, 'Location updated');
  });
}

module.exports = new DriverController();