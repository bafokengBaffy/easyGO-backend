const { Zone, sequelize, User, Driver, Ride, Payment, AuditLog } = require('../models');
const { Zone, sequelize, User, Driver, Ride, Payment } = require('../models');
const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { Op } = require('sequelize');

/**
 * AdminController - Administrative operations for platform management
 */
class AdminController {
  /**
   * Real-time dashboard metrics (rides, revenue, users, drivers)
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalDrivers, activeRides, dailyRevenue] = await Promise.all([
      User.count(),
      Driver.count({ where: { is_online: true } }),
      Ride.count({ where: { status: { [Op.in]: ['accepted', 'arrived', 'picked_up'] } } }),
      Payment.sum('amount', { where: { status: 'COMPLETED', createdAt: { [Op.gte]: today } } })
    ]);

    return res.json(new ApiResponse(200, {
      stats: {
        totalUsers,
        activeDrivers: totalDrivers,
        liveRides: activeRides,
        todayRevenue: dailyRevenue || 0
      }
    }, 'Dashboard stats retrieved'));
  });

  /**
   * Admin modification of any user account
   */
  updateUserByAdmin = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    await user.update(req.body);
    logger.info(`Admin ${req.user.id} updated user ${user.id}`);
    
    return res.json(new ApiResponse(200, user, 'User updated by administrator'));
  });

  /**
   * Creates a new geofence zone with PostGIS boundary.
   * Expects coords as [[lng, lat], [lng, lat], ...]
   */
  async createZone(req, res) {
    const { name, base_fare, coordinates } = req.body;

    try {
      // PostGIS requires Polygons to be closed (first and last point must be identical)
      const points = [...coordinates];
      if (points[0][0] !== points[points.length - 1][0] || points[0][1] !== points[points.length - 1][1]) {
        points.push(points[0]);
      }

      // Format: POLYGON((lng1 lat1, lng2 lat2, ...))
      const wktPolygon = `POLYGON((${points.map(p => `${p[0]} ${p[1]}`).join(', ')}))`;

      // Spatial check: Prevent overlapping zones
      const overlappingZone = await Zone.findOne({
        where: sequelize.where(
          sequelize.fn('ST_Intersects', 
            sequelize.col('boundary'), 
            sequelize.fn('ST_GeomFromText', wktPolygon, 4326)
          ),
          true
        )
      });

      if (overlappingZone) {
        return res.status(400).json({
          status: 'error',
          message: `Zone boundaries overlap with an existing zone: ${overlappingZone.name}`
        });
      }

      const zone = await Zone.create({
        name,
        base_fare,
        boundary: sequelize.fn('ST_GeomFromText', wktPolygon, 4326)
      });

      logger.info(`New geofence zone created: ${name}`);
      return res.status(201).json({
        status: 'success',
        data: zone
      });
    } catch (error) {
      logger.error('Failed to create geofence zone:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Admin lists all users with pagination
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { count, rows } = await User.findAndCountAll({
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    return res.json(new ApiResponse(200, { users: rows, total: count }));
  });

  /**
   * Fetches all defined zones for the management interface.
   */
  async getAllZones(req, res) {
    try {
      const zones = await Zone.findAll();
      return res.json({ status: 'success', data: zones });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Update driver online status or approval
   */
  updateDriverStatusByAdmin = asyncHandler(async (req, res) => {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) throw new ApiError(404, 'Driver not found');

    const { is_online, status } = req.body;
    const updates = {};
    if (is_online !== undefined) updates.is_online = is_online;
    if (status) updates.status = status;

    await driver.update(updates);
    
    return res.json(new ApiResponse(200, driver, 'Driver status updated'));
  });

  /**
   * Deletes a geofence zone by ID.
   */
  async deleteZone(req, res) {
    const { id } = req.params;
    try {
      const deleted = await Zone.destroy({ where: { id } });
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Zone not found' });
      }
      return res.json({ status: 'success', message: 'Zone deleted successfully' });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Finds which zone a coordinate belongs to.
   */
  async checkLocationZone(req, res) {
    const { lat, lng } = req.query;
    
    try {
      const zone = await Zone.findOne({
        where: sequelize.where(
          sequelize.fn('ST_Contains', sequelize.col('boundary'), 
            sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', lng, lat), 4326)
          ),
          true
        )
      });

      return res.json({ inZone: !!zone, zone });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Finds the nearest geofence zone to a given coordinate.
   * Returns the zone and the distance to its boundary.
   */
  async findNearestZone(req, res) {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ status: 'error', message: 'Latitude and longitude are required.' });
    }

    try {
      const point = sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', lng, lat), 4326);

      const nearestZone = await Zone.findOne({
        attributes: {
          include: [
            [sequelize.fn('ST_Distance', sequelize.col('boundary'), point), 'distance_meters']
          ]
        },
        order: sequelize.literal('distance_meters ASC'),
        limit: 1
      });

      return res.json({ status: 'success', data: nearestZone });
    } catch (error) {
      logger.error('Failed to find nearest geofence zone:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new AdminController();