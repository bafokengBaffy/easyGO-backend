const BaseService = require('./base.service');
const promotionRepository = require('../repositories/promotion.repository');

class PromotionService extends BaseService {
  constructor() {
    super(promotionRepository);
  }

  async validatePromotion(code) {
    const promo = await this.repository.findActiveByCode(code);
    if (!promo) return null;
    return promo;
  }

  async listPromotions() {
    return await this.getAll({ order: [['created_at', 'DESC']] });
  }

  async createPromotion(data) {
    return await this.create(data);
  }
}

module.exports = new PromotionService();
