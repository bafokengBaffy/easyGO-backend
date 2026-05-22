const { Driver } = require('../models');

const listDrivers = async () => Driver.findAll({ order: [['created_at', 'DESC']] });
const updateOnlineStatus = async (id, isOnline) => {
  const driver = await Driver.findByPk(id);
  if (!driver) return null;
  await driver.update({ is_online: Boolean(isOnline) });
  return driver;
};

module.exports = { listDrivers, updateOnlineStatus };
