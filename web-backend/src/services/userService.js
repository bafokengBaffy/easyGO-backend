const { User } = require('../models');
const ApiError = require('../utils/apiError');
const { syncUserToFirestore, syncFirebaseRoleClaims } = require('./firestoreUserService');

const listUsers = async () => User.findAll({ order: [['created_at', 'DESC']] });
const getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found.');
  return user;
};
const updateUser = async (id, payload) => {
  const user = await getUserById(id);
  const allowed = ['name', 'phone', 'avatar_url', 'status', 'role'];
  const safePayload = Object.fromEntries(Object.entries(payload || {}).filter(([key]) => allowed.includes(key)));
  if (Object.keys(safePayload).length === 0) {
    throw new ApiError(400, 'No valid fields to update.');
  }
  await user.update(safePayload);
  await Promise.all([syncUserToFirestore(user), syncFirebaseRoleClaims(user)]);
  return user;
};

module.exports = { listUsers, getUserById, updateUser };
