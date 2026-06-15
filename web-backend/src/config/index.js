const database = require('./database');
const firebase = require('./firebase');
const helmetConfig = require('./helmet');
const corsConfig = require('./cors');
const redis = require('./redis');
const rateLimiting = require('./rate-limiting');

module.exports = {
  database,
  firebase,
  helmet: helmetConfig,
  cors: corsConfig,
  redis,
  rateLimiting,
};
