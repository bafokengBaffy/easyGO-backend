const { admin, isFirebaseEnabled } = require('../config/firebase');

const USERS_COLLECTION = 'users';
const USER_ROLES_COLLECTION = 'user_roles';
const ROLE_MEMBERSHIPS_COLLECTION = 'role_memberships';

const toIso = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const buildUserDocument = (user) => ({
  user_id: String(user.id),
  firebase_uid: user.firebase_uid || null,
  name: user.name || null,
  email: user.email || null,
  role: user.role || 'rider',
  status: user.status || 'active',
  phone: user.phone || null,
  avatar_url: user.avatar_url || null,
  last_login: toIso(user.last_login),
  updated_at: admin.firestore.FieldValue.serverTimestamp(),
});

const buildRoleMembershipDocument = (user) => ({
  user_id: String(user.id),
  firebase_uid: user.firebase_uid || null,
  role: user.role || 'rider',
  email: user.email || null,
  status: user.status || 'active',
  updated_at: admin.firestore.FieldValue.serverTimestamp(),
});

const syncUserToFirestore = async (user) => {
  if (!isFirebaseEnabled || !user) return;

  const db = admin.firestore();
  const userDocId = user.firebase_uid || String(user.id);
  const userDoc = db.collection(USERS_COLLECTION).doc(userDocId);
  const roleDoc = db.collection(USER_ROLES_COLLECTION).doc(userDocId);
  const membershipDoc = db
    .collection(ROLE_MEMBERSHIPS_COLLECTION)
    .doc(user.role || 'rider')
    .collection('users')
    .doc(userDocId);

  await Promise.all([
    userDoc.set(buildUserDocument(user), { merge: true }),
    roleDoc.set(buildRoleMembershipDocument(user), { merge: true }),
    membershipDoc.set(buildRoleMembershipDocument(user), { merge: true }),
  ]);
};

const syncFirebaseRoleClaims = async (user) => {
  if (!isFirebaseEnabled || !user?.firebase_uid) return;
  const role = user.role || 'rider';
  await admin.auth().setCustomUserClaims(user.firebase_uid, { role });
};

module.exports = {
  syncUserToFirestore,
  syncFirebaseRoleClaims,
  USERS_COLLECTION,
  USER_ROLES_COLLECTION,
  ROLE_MEMBERSHIPS_COLLECTION,
};
