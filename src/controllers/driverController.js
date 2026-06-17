const driverService = require('../services/driverService');
const vehicleService = require('../services/vehicleService');
const rideService = require('../services/rideService');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { Driver, Ride, Payment } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * DriverController - Handles driver-related operations.
 */
class DriverController {
  /**
   * List all drivers (can be used by admin or for general listing).
   */
  list = asyncHandler(async (req, res) => {
    const drivers = await driverService.listDrivers(req.query);
    return res.status(200).json(new ApiResponse(200, drivers, 'Drivers retrieved successfully'));
  });

  /**
   * Get current driver profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({
      where: { user_id: req.user.id },
      include: ['Vehicle']
    });
    if (!driver) throw new ApiError(404, 'Driver profile not found');
    return res.json(new ApiResponse(200, driver));
  });

  /**
   * Get detailed driver profile for Admin
   */
  getDriverProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const driver = await Driver.findByPk(id, {
      include: [
        { model: Vehicle },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar_url'] }
      ]
    });

    if (!driver) throw new ApiError(404, 'Driver not found');

    // Aggregate performance data from Rides
    const performance = await Ride.findOne({
      where: { driver_id: id, status: 'completed' },
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalRides'],
        // Note: Assumes a rating column exists on the Ride table
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']
      ],
      raw: true
    });

    return res.json(new ApiResponse(200, {
      ...driver.toJSON(),
      performance: {
        totalRides: parseInt(performance?.totalRides || 0),
        averageRating: parseFloat(performance?.averageRating || 0).toFixed(1)
      }
    }, 'Driver profile retrieved'));
  });

  /**
   * Update driver vehicle
   */
  updateVehicle = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    const vehicle = await vehicleService.update(driver.vehicle_id, req.body);
    return res.json(new ApiResponse(200, vehicle, 'Vehicle updated'));
  });

  /**
   * Get earnings statistics
   */
  getEarnings = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    const stats = await Payment.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalEarnings'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'rideCount']
      ],
      where: { 
        status: 'COMPLETED',
        id: { [Op.in]: Sequelize.literal(`(SELECT id FROM Rides WHERE driver_id = ${driver.id})`) }
      },
      raw: true
    });
    return res.json(new ApiResponse(200, stats));
  });

  /**
   * Alias for list, specifically for admin routes.
   */
  listDrivers = this.list;

  /**
   * Set a driver's online status.
   */
  setOnlineStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { is_online } = req.body;

    if (is_online === undefined) {
      throw new ApiError(400, 'is_online status is required', 'MISSING_STATUS');
    }

    const updatedDriver = await driverService.updateOnlineStatus(id, is_online);
    if (!updatedDriver) {
      throw new ApiError(404, 'Driver not found', 'DRIVER_NOT_FOUND');
    }
    return res.status(200).json(new ApiResponse(200, updatedDriver, 'Driver online status updated'));
  });

  /**
   * Update driver real-time location
   */
  updateLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude, heading, speed } = req.body;
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    
    await driver.update({
      last_lat: latitude,
      last_lng: longitude,
      last_location_update: new Date(),
      metadata: { ...driver.metadata, last_heading: heading, last_speed: speed }
    });

    // Logic to update Redis/Socket for tracking would go here
    
    return res.json(new ApiResponse(200, null, 'Location updated'));
  });
}

module.exports = new DriverController();