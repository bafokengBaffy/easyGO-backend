const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '..');
const nodeEnv = process.env.NODE_ENV || 'production';
const envDefaultPath = path.join(root, '.env');
const envSpecificPath = path.join(root, `.env.${nodeEnv}`);

if (fs.existsSync(envDefaultPath)) {
  dotenv.config({ path: envDefaultPath });
}
if (fs.existsSync(envSpecificPath)) {
  dotenv.config({ path: envSpecificPath });
}

const required = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_DIALECT',
];

const missing = required.filter((key) => !process.env[key] || String(process.env[key]).trim() === '');
const corsValue = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
if (!corsValue || String(corsValue).trim() === '') {
  missing.push('CORS_ORIGIN or CORS_ORIGINS');
}

const errors = [];
if (missing.length) {
  errors.push(`Missing required keys: ${missing.join(', ')}`);
}

const firebaseUseAdc = process.env.FIREBASE_USE_ADC === 'true';
if (!firebaseUseAdc) {
  const hasInlineJson = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const hasPath = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  const hasParts =
    Boolean(process.env.FIREBASE_PROJECT_ID) &&
    Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
    Boolean(process.env.FIREBASE_PRIVATE_KEY);
  if (!hasInlineJson && !hasPath && !hasParts) {
    errors.push(
      'Firebase config incomplete: set FIREBASE_USE_ADC=true or provide FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.',
    );
  }
}

if (errors.length) {
  // eslint-disable-next-line no-console
  console.error('ENV VALIDATION FAILED');
  errors.forEach((error) => {
    // eslint-disable-next-line no-console
    console.error(`- ${error}`);
  });
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log(`ENV VALIDATION PASSED using ${path.basename(envSpecificPath)}${fs.existsSync(envDefaultPath) ? ' + .env' : ''}`);
