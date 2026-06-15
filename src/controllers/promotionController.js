const promotionService = require('../services/promotionService');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');

/**
 * Production Promotion Management Controller
 */
exports.create = asyncHandler(async (req, res) => {
  const promotion = await promotionService.createPromotion(req.body);
  return sendResponse(res, 201, promotion, 'Promotion created successfully');
});

exports.list = asyncHandler(async (req, res) => {
  const promotions = await promotionService.listPromotions();
  return sendResponse(res, 200, promotions, 'Promotions retrieved successfully');
});

exports.getById = asyncHandler(async (req, res) => {
  const promotion = await promotionService.getById(req.params.id);
  return sendResponse(res, 200, promotion);
});

exports.update = asyncHandler(async (req, res) => {
  const promotion = await promotionService.update(req.params.id, req.body);
  return sendResponse(res, 200, promotion, 'Promotion updated successfully');
});

exports.delete = asyncHandler(async (req, res) => {
  await promotionService.delete(req.params.id);
  return sendResponse(res, 200, null, 'Promotion deleted successfully');
});
