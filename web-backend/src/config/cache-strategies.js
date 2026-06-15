const logger = require('./logger');
const { getRedis } = require('./redis');

function defaultCacheClient() {
	const redis = getRedis();
	if (!redis) {
		logger.warn('Redis not available, cache strategies will be no-op');
		return {
			get: async () => null,
			set: async () => null,
			del: async () => null,
		};
	}
	return {
		get: async (key) => {
			const v = await redis.get(key);
			try { return JSON.parse(v); } catch (_) { return v; }
		},
		set: async (key, value, ttlSec) => {
			const v = typeof value === 'string' ? value : JSON.stringify(value);
			if (ttlSec) return redis.set(key, v, 'EX', Number(ttlSec));
			return redis.set(key, v);
		},
		del: async (key) => redis.del(key),
	};
}

module.exports = { defaultCacheClient };
