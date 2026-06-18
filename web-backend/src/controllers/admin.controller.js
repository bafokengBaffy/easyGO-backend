const { Zone, sequelize, User, Driver, Ride, Payment, AuditLog } = require('../models');
const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
let csvStringify;
try {
  csvStringify = require('csv-stringify/lib/sync');
} catch (err) {
  // Fallback simple CSV serializer if csv-stringify isn't installed
  csvStringify = (data, opts = {}) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    const keys = Object.keys(data[0]);
    const header = keys.join(',') + '\n';
    const rows = data.map(r => keys.map(k => {
      const v = r[k] == null ? '' : String(r[k]).replace(/"/g, '""');
      return `"${v}"`;
    }).join(',')).join('\n');
    return header + rows;
  };
}
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
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const [totalUsers, totalDrivers, activeRides, dailyRevenue, userGrowth] = await Promise.all([
      User.count(),
      Driver.count({ where: { is_online: true } }),
      Ride.count({ where: { status: { [Op.in]: ['accepted', 'arrived', 'picked_up'] } } }),
      Payment.sum('amount', { where: { status: 'COMPLETED', createdAt: { [Op.gte]: today } } }),
      User.count({ where: { createdAt: { [Op.gte]: lastMonth } } })
    ]);

    return res.json(new ApiResponse(200, {
      userMetrics: { totalUsers, monthlyGrowth: userGrowth },
      driverMetrics: { onlineDrivers: totalDrivers },
      rideMetrics: { activeRides },
      financialMetrics: { todayRevenue: dailyRevenue || 0 },
      timestamp: new Date()
    }, 'Dashboard stats retrieved'));
  });

  /**
   * Delete user (Admin override)
   */
  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) throw new ApiError(404, 'User not found');

    // Soft delete with reason in metadata
    await user.update({ 
      is_active: false, 
      status: 'deleted',
      metadata: { ...user.metadata, deletionReason: reason, deletedAt: new Date() }
    });

    logger.info(`Admin ${req.user.id} deleted user ${id}. Reason: ${reason}`);
    return res.json(new ApiResponse(200, null, 'User account deactivated by admin'));
  });

  /**
   * Verify or reject a driver
   */
  verifyDriverByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    const driver = await Driver.findByPk(id);
    if (!driver) throw new ApiError(404, 'Driver not found');

    await driver.update({ 
      verification_status: status,
      metadata: { ...driver.metadata, verificationNotes: reason }
    });

    return res.json(new ApiResponse(200, driver, `Driver status updated to ${status}`));
  });

  /**
   * Generate financial summary for reportRoutes
   */
  getFinancialSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const where = { status: 'COMPLETED' };
    
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const summary = await Payment.findAll({
      where,
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactionCount'],
        'provider'
      ],
      group: ['provider'],
      raw: true
    });

    const total = summary.reduce((acc, curr) => acc + parseFloat(curr.totalRevenue || 0), 0);

    return res.json(new ApiResponse(200, {
      providers: summary,
      totalRevenue: total,
      period: { startDate, endDate: endDate || new Date() }
    }, 'Financial summary generated'));
  });

  /**
   * Get system health metrics
   */
  getSystemHealth = asyncHandler(async (req, res) => {
    const dbStatus = await sequelize.authenticate().then(() => 'online').catch(() => 'offline');
    const memory = process.memoryUsage();
    
    return res.json(new ApiResponse(200, {
      database: dbStatus,
      uptime: process.uptime(),
      memory: {
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
        rss: `${Math.round(memory.rss / 1024 / 1024)}MB`
      }
    }, 'System health retrieved'));
  });

  /**
   * Get paginated audit logs
   */
  getAuditLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, action, userId } = req.query;
    const where = {};
    if (action) where.action = action;
    if (userId) where.user_id = userId;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    return res.json(new ApiResponse(200, { logs: rows, total: count }));
  });

  /**
   * Export audit logs to CSV
   */
  exportAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.findAll({ limit: 1000, order: [['createdAt', 'DESC']] });
    const data = logs.map(l => l.get({ plain: true }));
    const csv = csvStringify(data, { header: true });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
    return res.send(csv);
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

  /**
   * Get driver performance metrics (stub)
   */
  getDriverPerformance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Minimal: aggregate basic driver stats
    const completedRides = await Ride.count({ where: { driver_id: id, status: 'completed' } });
    const totalEarnings = await Payment.sum('amount', { where: { driver_id: id, status: 'COMPLETED' } }) || 0;
    return res.json(new ApiResponse(200, { driverId: id, completedRides, totalEarnings }, 'Driver performance retrieved'));
  });

  /**
   * System metrics (stub)
   */
  getSystemMetrics = asyncHandler(async (req, res) => {
    const memory = process.memoryUsage();
    return res.json(new ApiResponse(200, {
      cpuUsage: process.cpuUsage(),
      memory: {
        heapUsed: memory.heapUsed,
        rss: memory.rss
      },
      uptime: process.uptime()
    }, 'System metrics retrieved'));
  });

}

module.exports = new AdminController();