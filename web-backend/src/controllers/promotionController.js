const promotionService = require('../services/promotionService');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendPagedResponse } = require('../utils/response.util');
const { ApiResponse } = require('../utils/apiResponse');
const { NotFoundError, BadRequestError } = require('../utils/apiError');

/**
 * PromotionController - Handles discounts, campaigns, and user rewards
 */
class PromotionController {
  list = asyncHandler(async (req, res) => {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 20, offset: 0 };
    const { count, rows } = await promotionService.getAll({ 
      ...req.query, 
      limit, 
      offset 
    });
    return sendPagedResponse(res, 200, rows, count, page, limit);
  });

  getById = asyncHandler(async (req, res) => {
    const promotion = await promotionService.getById(req.params.id);
    if (!promotion) throw new NotFoundError('Promotion');
    return sendResponse(res, 200, promotion);
  });

  getAvailable = asyncHandler(async (req, res) => {
    const promotions = await promotionService.findAvailable(req.query);
    return sendResponse(res, 200, promotions);
  });

  validate = asyncHandler(async (req, res) => {
    const { code, amount } = req.body;
    const result = await promotionService.validateCode(code, { amount, userId: req.user.id });
    return sendResponse(res, 200, result, 'Code validated successfully');
  });

  apply = asyncHandler(async (req, res) => {
    const { code, rideId } = req.body;
    const result = await promotionService.applyToRide(code, rideId, req.user.id);
    return sendResponse(res, 200, result, 'Promotion applied to ride');
  });

  create = asyncHandler(async (req, res) => {
    const promotion = await promotionService.create(req.body);
    return res.status(201).json(new ApiResponse(201, promotion, 'Promotion campaign created'));
  });

  update = asyncHandler(async (req, res) => {
    const promotion = await promotionService.update(req.params.id, req.body);
    return sendResponse(res, 200, promotion, 'Promotion updated');
  });

  delete = asyncHandler(async (req, res) => {
    await promotionService.delete(req.params.id);
    return sendResponse(res, 200, null, 'Promotion deleted');
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const promotion = await promotionService.update(req.params.id, { is_active: status === 'active' });
    return sendResponse(res, 200, promotion, `Promotion status set to ${status}`);
  });

  // User Specific History and Saving
  getUserHistory = asyncHandler(async (req, res) => {
    const history = await promotionService.getUserUsageHistory(req.user.id);
    return sendResponse(res, 200, history);
  });

  savePromotion = asyncHandler(async (req, res) => {
    const { promotionId } = req.body;
    const result = await promotionService.saveForUser(req.user.id, promotionId);
    return sendResponse(res, 200, result, 'Promotion saved to your wallet');
  });

  unsavePromotion = asyncHandler(async (req, res) => {
    await promotionService.removeSaved(req.user.id, req.params.promotionId);
    return sendResponse(res, 200, null, 'Promotion removed from saved');
  });

  getSavedPromotions = asyncHandler(async (req, res) => {
    const saved = await promotionService.getSavedByUser(req.user.id);
    return sendResponse(res, 200, saved);
  });

  // Analytics
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await promotionService.getGlobalStats(req.query);
    return sendResponse(res, 200, stats);
  });

  getAnalytics = asyncHandler(async (req, res) => {
    const analytics = await promotionService.getCampaignAnalytics(req.params.id);
    return sendResponse(res, 200, analytics);
  });
}

module.exports = new PromotionController();