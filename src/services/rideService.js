const { Ride } = require('../models');
const ApiError = require('../utils/apiError');

const createRide = async (payload) => Ride.create(payload);
const listRides = async () => Ride.findAll({ order: [['created_at', 'DESC']] });
const getRideById = async (id) => {
  const ride = await Ride.findByPk(id);
  if (!ride) throw new ApiError(404, 'Ride not found.');
  return ride;
};
const updateRideStatus = async (id, status) => {
  const ride = await getRideById(id);
  await ride.update({ status });
  return ride;
};

module.exports = { createRide, listRides, getRideById, updateRideStatus };
