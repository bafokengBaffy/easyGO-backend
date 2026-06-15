const BaseService = require('./base.service');
const reviewRepository = require('../repositories/review.repository');
const { BadRequestException } = require('../exceptions/api.exception');

class ReviewService extends BaseService {
  constructor() {
    super(reviewRepository);
  }

  async createReview(reviewData) {
    // Logic to ensure a user doesn't review the same ride twice
    const existing = await this.repository.findOne({
      where: { 
        ride_id: reviewData.ride_id,
        reviewer_id: reviewData.reviewer_id 
      }
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this trip');
    }

    const review = await this.create(reviewData);
    
    // In a full production app, you might trigger an async job 
    // here to recalculate the driver's overall rating.
    return review;
  }
}

module.exports = new ReviewService();