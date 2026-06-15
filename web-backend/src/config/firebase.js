const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const formatPrivateKey = (key = '') => key.replace(/\\n/g, '\n');

const parseServiceAccountJson = () => {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineJson) {
    try {
      return JSON.parse(inlineJson);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_JSON value.');
    }
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) return null;

  const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
  if (!fs.existsSync(resolvedPath)) {
    // eslint-disable-next-line no-console
    console.warn(`Firebase service account file not found at: ${resolvedPath}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed reading Firebase service account file: ${error.message}`);
    return null;
  }
};

const getCredentialFromEnvParts = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return admin.credential.cert({ projectId, clientEmail, privateKey });
};

const getCredential = () => {
  const serviceAccount = parseServiceAccountJson();
  if (serviceAccount) {
    if (serviceAccount.private_key) {
      serviceAccount.private_key = formatPrivateKey(serviceAccount.private_key);
    }
    return admin.credential.cert(serviceAccount);
  }

  return getCredentialFromEnvParts();
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) return admin.app();

  const credential = getCredential();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || undefined;
  const projectId = process.env.FIREBASE_PROJECT_ID || undefined;

  if (credential) {
    return admin.initializeApp({ credential, databaseURL, projectId });
  }

  // Keyless mode: uses ADC (gcloud login locally, or attached service account in Cloud Run/GCE/GKE).
  if (process.env.FIREBASE_USE_ADC === 'true') {
    return admin.initializeApp({ databaseURL, projectId });
  }

  return null;
};

const firebaseApp = initializeFirebaseAdmin();

module.exports = {
  admin,
  firebaseApp,
  isFirebaseEnabled: Boolean(firebaseApp),
};
