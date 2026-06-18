const { createClient } = require('redis');
const logger = require('../utils/logger');
const config = require('./index');

const redisClient = createClient({
  url: config.REDIS_URL || `redis://${config.REDIS_HOST || 'localhost'}:${config.REDIS_PORT || 6379}`,
  password: config.REDIS_PASSWORD,
  socket: {
    tls: config.REDIS_TLS === 'true',
    // rejectUnauthorized is often set to false for cloud/self-signed certs. 
    // In strict production environments with valid CA certs, set this to true.
    rejectUnauthorized: false,
    connectTimeout: 10000,
    keepAlive: 5000
  }
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

module.exports = {
  redisClient,
  connectRedis
};