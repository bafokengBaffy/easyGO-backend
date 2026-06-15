/**
 * Unified API Response Formatter
 */
const sendResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

const sendPagedResponse = (res, statusCode, data, count, page, limit, message = 'Success') => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    meta: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit)
    },
    data
  });
};

module.exports = {
  sendResponse,
  sendPagedResponse
};