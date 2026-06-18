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

  async getRouteDetails(rideId) {
    const ride = await this.getById(rideId);
    const rideData = ride && typeof ride.toJSON === 'function' ? ride.toJSON() : ride;

    return {
      ...rideData,
      route: {
        pickup: {
          lat: rideData.pickup_lat,
          lng: rideData.pickup_lng,
          address: rideData.pickup_address
        },
        dropoff: {
          lat: rideData.dropoff_lat,
          lng: rideData.dropoff_lng,
          address: rideData.dropoff_address
        },
        distance_km: rideData.distance_km || null,
        estimated_duration_min: null,
        waypoints: []
      }
    };
  }
}

module.exports = new RideService();