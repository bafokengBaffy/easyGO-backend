/**
 * Environment Variable Validation Script
 * Ensures all required production variables are set before build or deployment.
 */
const fs = require('fs');
const path = require('path');

// List of required environment variables for production readiness
const REQUIRED_VARS = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT',
  'MPESA_API_URL',
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORTCODE',
  'MPESA_PASSKEY',
  'ECOCASH_MERCHANT_CODE',
  'ECOCASH_API_KEY',
  'ECOCASH_ENDPOINT',
  'CORS_ORIGINS'
];

const validate = () => {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Starting Pre-build Environment Validation...');
  
  const missing = [];
  
  REQUIRED_VARS.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Environment validation failed!');
    console.error('\x1b[31m%s\x1b[0m', 'The following required variables are missing:');
    missing.forEach(m => console.error(`   - ${m}`));
    process.exit(1);
  }

  console.log('\x1b[32m%s\x1b[0m', '✅ Environment variables validated successfully.');
  process.exit(0);
};

// Run validation
if (require.main === module) {
  validate();
}