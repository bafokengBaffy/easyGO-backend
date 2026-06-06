const IORedis = require('ioredis');
const logger = require('./logger');

let client = null;

function getRedis() {
	if (client) return client;
	const url = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://127.0.0.1:6379';
	client = new IORedis(url, { maxRetriesPerRequest: null });
	client.on('error', (err) => logger.error('Redis error', { err: err.message }));
	client.on('connect', () => logger.info('Connected to Redis'));
	return client;
}

module.exports = { getRedis };

