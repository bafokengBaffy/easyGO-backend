const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { admin, isFirebaseEnabled } = require('../config/firebase');
const ApiError = require('../utils/apiError');
const { syncUserToFirestore, syncFirebaseRoleClaims } = require('./firestoreUserService');

const sanitizeUser = (user) => ({
  id: user.id,
  firebase_uid: user.firebase_uid,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar_url: user.avatar_url,
  status: user.status,
  last_login: user.last_login,
});

const createLocalUser = async ({ name, email, password, role, firebase_uid = null }) =>
  User.create({
    name,
    email: email.toLowerCase(),
    password_hash: password ? await hashPassword(password) : null,
    role: role || 'rider',
    firebase_uid,
  });

const register = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) throw new ApiError(409, 'Email already registered.');

  let firebaseUid = null;
  if (isFirebaseEnabled) {
    try {
      const firebaseUser = await admin.auth().createUser({
        email: normalizedEmail,
        password,
        displayName: name,
      });
      firebaseUid = firebaseUser.uid;
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        throw new ApiError(409, 'Email already registered.');
      }
      throw err;
    }
  }

  const user = await createLocalUser({ name, email: normalizedEmail, password, role, firebase_uid: firebaseUid });
  await Promise.all([syncUserToFirestore(user), syncFirebaseRoleClaims(user)]);
  const token = signAccessToken({ id: user.id, email: user.email, role: user.role, firebase_uid: user.firebase_uid });

  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password, firebaseToken }) => {
  if (firebaseToken && isFirebaseEnabled) {
    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    if (!decoded || !decoded.email) throw new ApiError(401, 'Invalid Firebase token.');

    let user = await User.findOne({ where: { firebase_uid: decoded.uid } });
    if (!user) {
      const existingByEmail = await User.findOne({ where: { email: decoded.email.toLowerCase() } });
      if (existingByEmail) {
        user = await existingByEmail.update({ firebase_uid: decoded.uid });
      } else {
        user = await createLocalUser({
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          password: Math.random().toString(36).slice(2),
          role: 'rider',
          firebase_uid: decoded.uid,
        });
      }
    }

    await Promise.all([syncUserToFirestore(user), syncFirebaseRoleClaims(user)]);
    await user.update({ last_login: new Date() });
    await syncUserToFirestore(user);
    return { user: sanitizeUser(user), token: signAccessToken({ id: user.id, email: user.email, role: user.role, firebase_uid: user.firebase_uid }) };
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user || !(await comparePassword(password, user.password_hash || ''))) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  await user.update({ last_login: new Date() });
  await syncUserToFirestore(user);
  return { user: sanitizeUser(user), token: signAccessToken({ id: user.id, email: user.email, role: user.role, firebase_uid: user.firebase_uid }) };
};

module.exports = { register, login };
