const reviewService = require('../services/reviewService');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse, sendPagedResponse } = require('../utils/response.util');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 };
  const { count, rows } = await reviewService.repository.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
  return sendPagedResponse(res, 200, rows, count, page, limit);
});

exports.create = asyncHandler(async (req, res) => {
  const reviewData = {
    ...req.body,
    reviewer_id: req.user.id,
    // Determine if the reviewer is the rider or driver based on their role
    reviewer_role: req.user.role 
  };
  const review = await reviewService.createReview(reviewData);
  return sendResponse(res, 201, review, 'Review submitted successfully');
});
