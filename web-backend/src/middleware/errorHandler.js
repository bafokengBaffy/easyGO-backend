module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    success: false,
    error: status >= 500 ? 'Internal Server Error' : 'Request Error',
    message: err.message || 'An unexpected error occurred',
    details: err.details || undefined,
  });
};
