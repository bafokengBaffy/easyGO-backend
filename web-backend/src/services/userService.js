const { User } = require('../models');
const ApiError = require('../utils/apiError');

const listUsers = async () => User.findAll({ order: [['created_at', 'DESC']] });
const getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found.');
  return user;
};
const updateUser = async (id, payload) => {
  const user = await getUserById(id);
  await user.update(payload);
  return user;
};

module.exports = { listUsers, getUserById, updateUser };
