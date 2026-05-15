const users = require('../data/mockUsers');

exports.getProfile = (req, res) => {
  const profile = users[0];

  if (!profile) {
    return res.status(404).json({ success: false, message: 'Profile not found.' });
  }

  return res.json({ success: true, profile });
};
