const { sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

exports.health = asyncHandler(async (req, res) => {
  let db = 'down';
  try {
    await sequelize.authenticate();
    db = 'up';
  } catch (e) {
    db = 'down';
  }

  return res.json({
    success: true,
    service: 'easygo-web-backend',
    time: new Date().toISOString(),
    checks: { database: db },
  });
});

exports.detailedHealth = asyncHandler(async (req, res) => {
  const dbStatus = await sequelize.authenticate().then(() => 'healthy').catch(() => 'unhealthy');
  
  const healthData = {
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    services: {
      database: { status: dbStatus },
      cache: { status: 'operational' }, // Placeholder for Redis
      messaging: { status: 'operational' } // Placeholder for RabbitMQ/Firebase
    },
    system: {
      memoryUsage: process.memoryUsage(),
      platform: process.platform
    }
  };

  return res.status(dbStatus === 'healthy' ? 200 : 503).json(healthData);
});

exports.databaseHealth = asyncHandler(async (req, res) => {
  const start = Date.now();
  await sequelize.authenticate();
  const duration = Date.now() - start;

  return res.json({
    status: 'healthy',
    responseTime: `${duration}ms`,
    connection: 'active'
  });
});

exports.info = asyncHandler(async (req, res) => {
  return res.json({
    version: '2.0.0',
    name: 'easygo-platform-api',
    description: 'Ride-sharing backend for Lesotho'
  });
});
