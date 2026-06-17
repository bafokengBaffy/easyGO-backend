const { Report } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const reportService = require('../services/reportService');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * ReportController - Handles data export and periodic analytics generation
 */
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };
  const { count, rows } = await Report.findAndCountAll({
    where: { owner_id: req.user.id },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  return sendResponse(res, 200, { reports: rows, total: count }, 'Reports fetched.');
});

exports.generate = asyncHandler(async (req, res) => {
  const { type, period } = req.body;
  let data;
  
  if (type === 'performance') {
    data = await reportService.getWeeklyPerformanceReport();
  } else {
    data = { message: 'Report generation queued', type, period };
  }

  return res.status(202).json(new ApiResponse(202, data, 'Report generation initiated'));
});

exports.getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findByPk(req.params.id);
  if (!report) throw new ApiResponse(404, null, 'Report not found');
  if (report.owner_id !== req.user.id && req.user.role !== 'admin') throw new ApiResponse(403, null, 'Unauthorized');
  return sendResponse(res, 200, report);
});

exports.getRevenueReport = asyncHandler(async (req, res) => {
  const report = await reportService.getWeeklyPerformanceReport();
  return sendResponse(res, 200, report);
});

exports.download = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, { url: 'https://storage.easygo.com/reports/sample.pdf' }, 'Download link generated');
});
