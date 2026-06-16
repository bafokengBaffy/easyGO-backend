const driverService = require('../services/driverService');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');

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
}

module.exports = new DriverController();