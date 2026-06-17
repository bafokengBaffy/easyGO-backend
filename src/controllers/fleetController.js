const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendPagedResponse } = require('../utils/response.util');
const { Driver, Vehicle } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * FleetController - Handles management of vehicle groups and fleet owners
 */
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };
  // In a full implementation, this would query a 'Fleets' table. 
  // Here we simulate by showing drivers assigned to fleets.
  const { count, rows } = await Driver.findAndCountAll({
    include: [{ model: Vehicle }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  return sendPagedResponse(res, 200, rows, count, page, limit);
});

exports.create = asyncHandler(async (req, res) => {
  // Mock fleet creation logic
  const fleet = { id: `flt_${Date.now()}`, ...req.body };
  return res.status(201).json(new ApiResponse(201, fleet, 'Fleet created successfully'));
});

exports.getFleetById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fleet = { id, name: "Premium Fleet", vehicles: [] }; // Mock data
  return sendResponse(res, 200, fleet);
});

exports.getFleetStatistics = asyncHandler(async (req, res) => {
  const stats = {
    totalVehicles: await Vehicle.count(),
    activeDrivers: await Driver.count({ where: { is_online: true } }),
    utilizationRate: "85%"
  };
  return sendResponse(res, 200, stats, 'Fleet statistics retrieved');
});

exports.addVehicleToFleet = asyncHandler(async (req, res) => {
  const { id, vehicleId } = req.body;
  return sendResponse(res, 200, { fleetId: id, vehicleId }, 'Vehicle added to fleet');
});

exports.getDefaultSettings = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, { currency: 'LSL', timezone: 'Africa/Maseru' });
});
