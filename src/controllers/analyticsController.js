const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');

/**
 * AnalyticsController - Detailed insights for administrators
 */
exports.summary = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  return sendResponse(res, 200, stats, 'Analytics summary fetched.');
});

exports.getDashboardAnalytics = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  return sendResponse(res, 200, stats);
});

exports.getRideAnalytics = asyncHandler(async (req, res) => {
  // Mock ride analytics
  const data = { totalRides: 1500, peakHour: "18:00", popularZone: "Maseru Central" };
  return sendResponse(res, 200, data);
});

exports.getFinancialAnalytics = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  return sendResponse(res, 200, {
    todayRevenue: stats.todayRevenue,
    monthlyRevenue: stats.monthlyRevenue
  });
});
