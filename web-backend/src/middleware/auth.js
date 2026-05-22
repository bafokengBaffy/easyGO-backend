const { verifyAccessToken } = require('../utils/jwt');
const { admin, isFirebaseEnabled } = require('../config/firebase');
const { User } = require('../models');

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
    const localUser = decoded?.uid ? await User.findOne({ where: { firebase_uid: decoded.uid } }) : null;
    req.user = {
      id: localUser?.id || decoded.uid,
      email: decoded.email,
      role: decoded.role || localUser?.role || 'rider',
      firebase_uid: decoded.uid,
      authProvider: 'firebase',
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
