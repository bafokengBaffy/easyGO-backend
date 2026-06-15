const BaseService = require('./base.service');
const driverRepository = require('../repositories/driver.repository');

class DriverService extends BaseService {
  constructor() {
    super(driverRepository);
  }

  async listDrivers() {
    return await this.repository.findAll({ order: [['created_at', 'DESC']] });
  }

  async updateOnlineStatus(id, isOnline) {
    return await this.update(id, { 
      is_online: Boolean(isOnline),
      last_location_update: new Date()
    });
  }
}

module.exports = new DriverService();
