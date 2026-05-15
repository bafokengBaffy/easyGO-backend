module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  return res.status(status).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
};
