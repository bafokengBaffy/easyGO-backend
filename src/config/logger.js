const { createLogger, format, transports } = require('winston');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

const defaultMeta = { service: process.env.npm_package_name || 'easygo-web-backend' };

const filename = process.env.LOG_FILE || path.join(process.cwd(), 'logs', `${env}.log`);

const logger = createLogger({
	level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
	format: format.combine(
		format.timestamp(),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
	defaultMeta,
	transports: [
		new transports.File({ filename, handleExceptions: true, maxsize: 5 * 1024 * 1024 }),
	],
	exitOnError: false,
});

// In non-production log to console in a readable way
if (env !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(format.colorize(), format.simple()),
	}));
}

// Stream for morgan
logger.stream = {
	write: (message) => {
		logger.info(message.trim());
	},
};

module.exports = logger;
