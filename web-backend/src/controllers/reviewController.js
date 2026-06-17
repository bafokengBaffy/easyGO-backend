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

exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await reviewService.getById(req.params.id);
  if (!review) throw new NotFoundError('Review');
  return sendResponse(res, 200, review);
});

exports.update = asyncHandler(async (req, res) => {
  const review = await reviewService.update(req.params.id, req.body);
  return sendResponse(res, 200, review, 'Review updated');
});

exports.delete = asyncHandler(async (req, res) => {
  await reviewService.delete(req.params.id);
  return sendResponse(res, 200, null, 'Review deleted');
});

exports.respond = asyncHandler(async (req, res) => {
  const { response } = req.body;
  const review = await reviewService.update(req.params.id, { 
    response_text: response,
    responded_at: new Date()
  });
  return sendResponse(res, 200, review, 'Response added to review');
});

exports.report = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const review = await reviewService.update(req.params.id, {
    is_flagged: true,
    flag_reason: reason
  });
  return sendResponse(res, 200, review, 'Review reported for moderation');
});

exports.moderate = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const isHidden = action === 'hide';
  await reviewService.update(req.params.id, { is_visible: !isHidden });
  return sendResponse(res, 200, null, `Review ${action} successfully`);
});
