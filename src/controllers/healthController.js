const { sequelize } = require('../models');

exports.health = async (req, res) => {
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
};
