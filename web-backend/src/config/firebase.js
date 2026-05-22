const admin = require('firebase-admin');

const formatPrivateKey = (key = '') => key.replace(/\\n/g, '\n');

const getCredential = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return admin.credential.cert({ projectId, clientEmail, privateKey });
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  const credential = getCredential();
  if (!credential) {
    return null;
  }

  return admin.initializeApp({ credential });
};

const firebaseApp = initializeFirebaseAdmin();

module.exports = {
  admin,
  firebaseApp,
  isFirebaseEnabled: Boolean(firebaseApp),
};
