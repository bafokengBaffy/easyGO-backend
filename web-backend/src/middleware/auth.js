const { verifyAccessToken } = require('../utils/jwt');
const { admin, isFirebaseEnabled } = require('../config/firebase');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing access token.' });
    }

    try {
      req.user = verifyAccessToken(token);
      return next();
    } catch (jwtErr) {
      if (!isFirebaseEnabled) throw jwtErr;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'rider',
      authProvider: 'firebase',
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
