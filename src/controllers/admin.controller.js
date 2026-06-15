const { User, Ride, Driver, Payment, Incident } = require('../models');
const { Sequelize, Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService'); // Import userService
const driverService = require('../services/driverService'); // Import driverService
const reportService = require('../services/reportService'); // Import reportService
const { sendResponse, sendPagedResponse } = require('../utils/response.util'); // Import sendPagedResponse

/**
 * Production Admin Dashboard Controller
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeDrivers,
    ridesToday,
    pendingIncidents,
    revenueData
  ] = await Promise.all([
    User.count(),
    Driver.count({ where: { is_online: true } }),
    Ride.count({ 
      where: { 
        created_at: { [Op.gte]: today } 
      } 
    }),
    Incident.count({ where: { status: 'open' } }),
    Payment.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']
      ],
      where: { status: 'COMPLETED' },
      raw: true
    })
  ]);

  // Get ride status breakdown for chart
  const rideBreakdown = await Ride.findAll({
    attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true
  });

  return sendResponse(res, 200, {
    overview: {
      users: totalUsers,
      online_drivers: activeDrivers,
      rides_today: ridesToday,
      open_incidents: pendingIncidents,
      total_revenue: parseFloat(revenueData?.totalRevenue || 0)
    },
    ride_distribution: rideBreakdown
  }, 'Dashboard stats compiled successfully');
});

exports.getWeeklyReport = asyncHandler(async (req, res) => {
  const report = await reportService.getWeeklyPerformanceReport();
  return sendResponse(res, 200, report, 'Weekly performance report generated');
});

// Admin User Management
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination;
  const { count, rows } = await userService.repository.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
  return sendPagedResponse(res, 200, rows, count, page, limit, 'Users fetched successfully');
});

exports.updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  return sendResponse(res, 200, user, 'User updated successfully by admin');
});

// Admin Driver Management
exports.updateDriverStatusByAdmin = asyncHandler(async (req, res) => {
  const { is_online } = req.body;
  const driver = await driverService.updateOnlineStatus(req.params.id, is_online); // Use driverService to update status
  return sendResponse(res, 200, driver, `Driver status updated to ${is_online ? 'online' : 'offline'} by admin`);
});