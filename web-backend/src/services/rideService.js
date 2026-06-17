const BaseService = require('./base.service');
const rideRepository = require('../repositories/ride.repository');

class RideService extends BaseService {
  constructor() {
    super(rideRepository);
  }

  async getRiderHistory(riderId) {
    return await this.repository.findAll({ where: { rider_id: riderId } });
  }

  async updateRideStatus(rideId, status) {
    return await this.update(rideId, { 
      status,
      status_updated_at: new Date()
    });
  }
}

module.exports = new RideService();