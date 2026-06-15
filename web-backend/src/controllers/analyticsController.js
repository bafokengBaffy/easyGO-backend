exports.summary = async (req, res) => {
  res.json({
    success: true,
    message: 'Analytics summary fetched.',
    data: { rides_today: 0, active_drivers: 0, completion_rate: 0, revenue_today: 0 },
  });
};
