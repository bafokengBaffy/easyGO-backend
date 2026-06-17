const AppleAuth = require('apple-signin-auth');
const User = require('../../models/User');

exports.verifyAppleToken = async (req, res) => {
  const { id_token, user } = req.body;

  try {
    const { sub: appleId, email } = await AppleAuth.verifyIdToken(id_token, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    // Find or create user in PostgreSQL
    let dbUser = await User.findOne({ where: { apple_id: appleId } });
    
    if (!dbUser) {
      dbUser = await User.create({
        apple_id: appleId,
        email: email,
        name: user ? `${user.name.firstName} ${user.name.lastName}` : 'Apple User'
      });
    }

    res.status(200).json({ success: true, user: dbUser });
  } catch (err) {
    res.status(401).json({ message: 'Apple Authentication Failed', error: err.message });
  }
};