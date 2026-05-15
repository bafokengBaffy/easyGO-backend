exports.getHealth = (req, res) => {
  res.json({
    status: 'ok',
    service: 'EasyGo Web Backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};
