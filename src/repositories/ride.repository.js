const BaseRepository = require('./base.repository');
const { Ride } = require('../models');

class RideRepository extends BaseRepository {
  constructor() {
    super(Ride);
  }
}

module.exports = new RideRepository();