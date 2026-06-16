/**
 * Production-Grade Winston Logger for EasyGO Backend
 * Features: Daily rotation, multiple transports, structured logging, performance tracking
 * @version 2.0.0
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const os = require('os');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');

// Custom format for console output (development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0 && !meta.service) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// Custom format for file output (JSON structured)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
);

// Determine log level based on environment
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const customLevel = process.env.LOG_LEVEL;
  
  if (customLevel) return customLevel;
  
  switch (env) {
    case 'production':
      return 'info';
    case 'staging':
      return 'debug';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
};

// Create daily rotate file transport for all logs
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: fileFormat,
  level: getLogLevel(),
});

// Daily rotate for error logs
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  format: fileFormat,
  level: 'error',
});

// HTTP request logs (morgan integration)
const httpLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
  level: 'http',
});

// Exception logs
const exceptionLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'exceptions-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

// Console transport (development only)
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: getLogLevel(),
});

// Performance logs
const performanceLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'performance-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
  level: 'verbose',
});

// Build transports array
const transports = [
  dailyRotateFileTransport,
  errorFileTransport,
  httpLogTransport,
  performanceLogTransport,
];

// Add console transport in non-production environments
const env = process.env.NODE_ENV || 'development';
if (env !== 'production' && env !== 'test') {
  transports.push(consoleTransport);
}

// Create the logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  format: fileFormat,
  defaultMeta: {
    service: process.env.npm_package_name || 'easygo-web-backend',
    hostname: os.hostname(),
    pid: process.pid,
    environment: env,
    version: process.env.npm_package_version || '1.0.0',
  },
  transports,
  exceptionHandlers: [exceptionLogTransport],
  rejectionHandlers: [exceptionLogTransport],
  exitOnError: false,
});

// Add stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Log API request with performance metrics
 */
logger.logRequest = (req, res, duration) => {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.requestId,
    correlationId: req.correlationId,
  }, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
};

/**
 * Log database query performance
 */
logger.logQuery = (query, duration, params = null) => {
  logger.debug({
    type: 'database_query',
    query: query.substring(0, 500),
    duration: `${duration}ms`,
    params: params ? JSON.stringify(params).substring(0, 200) : null,
  });
};

/**
 * Log API call to external service
 */
logger.logExternalCall = (service, endpoint, duration, success, error = null) => {
  const level = success ? 'info' : 'error';
  logger[level]({
    type: 'external_api',
    service,
    endpoint,
    duration: `${duration}ms`,
    success,
    error: error ? error.message : null,
  });
};

/**
 * Log business event
 */
logger.logEvent = (eventName, data, userId = null) => {
  logger.info({
    type: 'business_event',
    event: eventName,
    userId,
    data,
  });
};

/**
 * Log security event (auth attempts, permission changes, etc.)
 */
logger.logSecurity = (eventName, data, userId = null, ip = null) => {
  logger.warn({
    type: 'security_event',
    event: eventName,
    userId,
    ip,
    data,
  });
};

/**
 * Log performance metrics
 */
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.verbose({
    type: 'performance',
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

/**
 * Create a child logger with additional context
 */
logger.child = (context) => {
  return logger.child(context);
};

/**
 * Flush all transports (useful before process exit)
 */
logger.flush = () => {
  return new Promise((resolve) => {
    let pending = transports.length;
    if (pending === 0) {
      resolve();
      return;
    }
    
    transports.forEach((transport) => {
      transport.once('finish', () => {
        pending--;
        if (pending === 0) resolve();
      });
      transport.end();
    });
    
    setTimeout(resolve, 5000);
  });
};

// Log startup
logger.info('Logger initialized', {
  level: getLogLevel(),
  environment: env,
  logDirectory: logDir,
  transports: transports.map(t => t.name || t.constructor.name),
});

module.exports = logger;