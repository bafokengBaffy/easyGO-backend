const { Promotion } = require('../models');

const listPromotions = async () => Promotion.findAll({ order: [['created_at', 'DESC']] });
const createPromotion = async (payload) => Promotion.create(payload);

module.exports = { listPromotions, createPromotion };
