﻿/**
 * Central Configuration Module for EasyGO Backend
 * Loads and validates all environment variables
 * @version 2.0.0
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'staging' 
    ? '.env.staging' 
    : '.env.development';

dotenv.config({ path: path.join(process.cwd(), envFile) });
dotenv.config({ path: path.join(process.cwd(), '.env') }); // Fallback

// Helper to parse boolean strings
const parseBool = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
};

// Helper to parse integer with default
const parseIntEnv = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper to parse array from comma-separated string
const parseArray = (value, defaultValue = []) => {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
};

const config = {
  // ==================== APP CONFIGURATION ====================
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseIntEnv(process.env.PORT, 4000),
  HOST: process.env.HOST || '0.0.0.0',
  API_VERSION: process.env.API_VERSION || 'v1',
  APP_NAME: process.env.APP_NAME || 'EasyGO Web Backend',
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:4000',
  
  // ==================== CLUSTER CONFIGURATION ====================
  CLUSTER_MODE: parseBool(process.env.CLUSTER_MODE, false),
  WORKERS: parseIntEnv(process.env.WORKERS, null),
  
  // ==================== SERVER TIMEOUTS ====================
  SERVER_TIMEOUT: parseIntEnv(process.env.SERVER_TIMEOUT, 120000),
  KEEP_ALIVE_TIMEOUT: parseIntEnv(process.env.KEEP_ALIVE_TIMEOUT, 65000),
  HEADERS_TIMEOUT: parseIntEnv(process.env.HEADERS_TIMEOUT, 66000),
  MAX_HEADERS_COUNT: parseIntEnv(process.env.MAX_HEADERS_COUNT, 2000),
  MAX_MEMORY: parseIntEnv(process.env.MAX_MEMORY, 512),
  
  // ==================== SSL/TLS CONFIGURATION ====================
  SSL_ENABLED: parseBool(process.env.SSL_ENABLED, false),
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  SSL_CA_PATH: process.env.SSL_CA_PATH,
  SSL_REJECT_UNAUTHORIZED: parseBool(process.env.SSL_REJECT_UNAUTHORIZED, true),
  
  // ==================== DATABASE CONFIGURATION ====================
  DATABASE: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseIntEnv(process.env.DB_PORT, 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '0595',
    database: process.env.DB_NAME || 'easygo_dev',
    
    // Connection Pool
    pool: {
      max: parseIntEnv(process.env.DB_POOL_MAX, 20),
      min: parseIntEnv(process.env.DB_POOL_MIN, 2),
      acquire: parseIntEnv(process.env.DB_POOL_ACQUIRE, 30000),
      idle: parseIntEnv(process.env.DB_POOL_IDLE, 10000),
      evict: parseIntEnv(process.env.DB_POOL_EVICT, 1000),
    },
    
    // SSL Configuration
    ssl: parseBool(process.env.DB_SSL, false),
    sslRejectUnauthorized: parseBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
    
    // Sync Options
    sync: parseBool(process.env.DB_SYNC, false),
    syncAlter: parseBool(process.env.DB_SYNC_ALTER, false),
    syncForce: parseBool(process.env.DB_SYNC_FORCE, false),
    
    // Logging
    logging: process.env.NODE_ENV === 'development',
    logParameters: parseBool(process.env.DB_LOG_PARAMETERS, false),
    
    // Timezone
    timezone: process.env.DB_TIMEZONE || '+00:00',
    
    // Retry Configuration
    retry: {
      max: parseIntEnv(process.env.DB_RETRY_MAX, 3),
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      backoffBase: parseIntEnv(process.env.DB_RETRY_BACKOFF_BASE, 1000),
      backoffExponent: parseFloat(process.env.DB_RETRY_BACKOFF_EXPONENT, 1.5),
    },
    
    // Define Options
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  },
  
  // ==================== REDIS CONFIGURATION ====================
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseIntEnv(process.env.REDIS_PORT, 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_TLS: parseBool(process.env.REDIS_TLS, false),
  REDIS: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseIntEnv(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD,
    db: parseIntEnv(process.env.REDIS_DB, 0),
    tls: parseBool(process.env.REDIS_TLS, false),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'easygo:',
    
    // Connection Pool
    pool: {
      max: parseIntEnv(process.env.REDIS_POOL_MAX, 10),
      min: parseIntEnv(process.env.REDIS_POOL_MIN, 2),
      idle: parseIntEnv(process.env.REDIS_POOL_IDLE, 10000),
    },
    
    // Cache Settings
    ttl: parseIntEnv(process.env.REDIS_TTL, 3600),
    cacheEnabled: parseBool(process.env.REDIS_CACHE_ENABLED, true),
  },
  
  // ==================== JWT AUTHENTICATION ====================
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  BCRYPT_SALT_ROUNDS: parseIntEnv(process.env.BCRYPT_SALT_ROUNDS, 12),
  
  // Backwards-compatible JWT object for older tests
  JWT: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // ==================== CORS CONFIGURATION ====================
  CORS_ORIGINS: parseArray(process.env.CORS_ORIGINS, ['http://localhost:5173', 'http://localhost:3000']),
  CORS_CREDENTIALS: parseBool(process.env.CORS_CREDENTIALS, true),
  CORS_METHODS: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  CORS_ALLOWED_HEADERS: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,X-Request-ID,X-Correlation-ID',
  CORS_MAX_AGE: parseIntEnv(process.env.CORS_MAX_AGE, 86400),
  
  // ==================== RATE LIMITING ====================
  RATE_LIMIT_WINDOW_MS: parseIntEnv(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX_REQUESTS: parseIntEnv(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  RATE_LIMIT_SKIP_SUCCESSFUL: parseBool(process.env.RATE_LIMIT_SKIP_SUCCESSFUL, false),
  
  // ==================== FILE UPLOADS ====================
  MAX_UPLOAD_SIZE: parseIntEnv(process.env.MAX_UPLOAD_SIZE, 5242880), // 5MB
  ALLOWED_FILE_TYPES: parseArray(process.env.ALLOWED_FILE_TYPES, ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  
  // ==================== LOGGING ====================
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'logs/app.log',
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || '14d',
  LOG_MAX_SIZE: process.env.LOG_MAX_SIZE || '20m',
  
  // ==================== FIREBASE ====================
  FIREBASE_USE_ADC: parseBool(process.env.FIREBASE_USE_ADC, true),
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'easygols',
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  
  // ==================== PAYMENT INTEGRATIONS ====================
  PAYMENT_SIGNATURE_SECRET: process.env.PAYMENT_SIGNATURE_SECRET,
  PAYMENT_ENCRYPTION_KEY: process.env.PAYMENT_ENCRYPTION_KEY,
  ENABLE_PAYMENTS: parseBool(process.env.ENABLE_PAYMENTS, true),
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  
  // M-Pesa
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY: process.env.MPESA_PASSKEY,
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
  MPESA_ENVIRONMENT: process.env.MPESA_ENVIRONMENT || 'sandbox',
  
  // EcoCash
  ECOCASH_API_KEY: process.env.ECOCASH_API_KEY,
  ECOCASH_API_SECRET: process.env.ECOCASH_API_SECRET,
  ECOCASH_MERCHANT_ID: process.env.ECOCASH_MERCHANT_ID,
  ECOCASH_ENVIRONMENT: process.env.ECOCASH_ENVIRONMENT || 'sandbox',
  
  // ==================== EMAIL & SMS ====================
  // SendGrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@easygo.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'EasyGO',
  
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // ==================== CLOUD STORAGE ====================
  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // ==================== EXTERNAL SERVICES ====================
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_REGION: process.env.GOOGLE_MAPS_REGION || 'us',
  
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  ENABLE_AI_SERVICES: parseBool(process.env.ENABLE_AI_SERVICES, false),
  
  // ==================== WEBSOCKETS ====================
  ENABLE_WEBSOCKETS: parseBool(process.env.ENABLE_WEBSOCKETS, true),
  SOCKET_PATH: process.env.SOCKET_PATH || '/socket.io',
  SOCKET_PING_TIMEOUT: parseIntEnv(process.env.SOCKET_PING_TIMEOUT, 5000),
  SOCKET_PING_INTERVAL: parseIntEnv(process.env.SOCKET_PING_INTERVAL, 25000),
  
  // ==================== FRONTEND ====================
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // ==================== MONITORING ====================
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  ENABLE_METRICS: parseBool(process.env.ENABLE_METRICS, true),
  
  // ==================== FEATURE FLAGS ====================
  FEATURES: {
    enablePayments: parseBool(process.env.ENABLE_PAYMENTS, true),
    enableWebhooks: parseBool(process.env.ENABLE_WEBHOOKS, true),
    enablePushNotifications: parseBool(process.env.ENABLE_PUSH_NOTIFICATIONS, true),
    enableSmsNotifications: parseBool(process.env.ENABLE_SMS_NOTIFICATIONS, true),
    enableEmailNotifications: parseBool(process.env.ENABLE_EMAIL_NOTIFICATIONS, true),
    enableAuditLogs: parseBool(process.env.ENABLE_AUDIT_LOGS, true),
    enableAnalytics: parseBool(process.env.ENABLE_ANALYTICS, true),
  },
  
  // ==================== CACHE STRATEGIES ====================
  CACHE: {
    defaultTTL: parseIntEnv(process.env.CACHE_DEFAULT_TTL, 3600),
    rideTTL: parseIntEnv(process.env.CACHE_RIDE_TTL, 300),
    userTTL: parseIntEnv(process.env.CACHE_USER_TTL, 600),
    locationTTL: parseIntEnv(process.env.CACHE_LOCATION_TTL, 10),
  },
  
  // ==================== PRICING ====================
  PRICING: {
    baseFare: parseFloat(process.env.BASE_FARE || '2.00'),
    perKmRate: parseFloat(process.env.PER_KM_RATE || '1.50'),
    perMinuteRate: parseFloat(process.env.PER_MINUTE_RATE || '0.30'),
    minimumFare: parseFloat(process.env.MINIMUM_FARE || '3.00'),
    cancellationFee: parseFloat(process.env.CANCELLATION_FEE || '2.00'),
    waitingRatePerMinute: parseFloat(process.env.WAITING_RATE_PER_MINUTE || '0.20'),
    surgeMultiplierMax: parseFloat(process.env.SURGE_MULTIPLIER_MAX || '3.00'),
  },
};

// Validate critical configuration in production
if (config.NODE_ENV === 'production') {
  const criticalVars = ['JWT_SECRET', 'DATABASE.password'];
  const missing = [];
  
  if (config.JWT_SECRET === 'default-jwt-secret-change-me') {
    missing.push('JWT_SECRET');
  }
  
  if (config.DATABASE.password === '0595' && config.DATABASE.host !== 'localhost') {
    missing.push('DATABASE_PASSWORD (using default in production)');
  }
  
  if (missing.length > 0) {
    console.error(`[ERROR] Missing or invalid critical configuration: ${missing.join(', ')}`);
    console.error('Please set proper values in .env.production file');
    process.exit(1);
  }
}

// Log configuration in development (without secrets)
if (config.NODE_ENV === 'development') {
  const safeConfig = {
    ...config,
    JWT_SECRET: config.JWT_SECRET ? '***' : undefined,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET ? '***' : undefined,
    PAYMENT_SIGNATURE_SECRET: config.PAYMENT_SIGNATURE_SECRET ? '***' : undefined,
    PAYMENT_ENCRYPTION_KEY: config.PAYMENT_ENCRYPTION_KEY ? '***' : undefined,
    DATABASE: {
      ...config.DATABASE,
      password: '***',
    },
    REDIS: {
      ...config.REDIS,
      password: config.REDIS.password ? '***' : undefined,
    },
  };
  
  console.log('[Config] Loaded configuration:', JSON.stringify(safeConfig, null, 2));
}

module.exports = config;