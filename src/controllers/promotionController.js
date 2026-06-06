const promotionService = require('../services/promotionService');
const { ok } = require('../utils/apiResponse');

exports.create = async (req, res, next) => {
  try {
    return ok(res, await promotionService.createPromotion(req.body), 'Promotion created.', 201);
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    return ok(res, await promotionService.listPromotions(), 'Promotions fetched.');
  } catch (e) {
    return next(e);
  }
};
