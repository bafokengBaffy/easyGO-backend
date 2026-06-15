// Production logger with structured logging
const winston = require('winston');
const path = require('path');
const config = require('../config');

const logDir = 'logs';
const { combine, timestamp, printf, colorize, json } = winston.format;

const myFormat = printf(({ level, message, timestamp, correlationId, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    correlationId,
    message,
    ...meta
  });
});

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp(),
    config.NODE_ENV === 'production' ? json() : myFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (config.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      myFormat
    )
  }));
}

module.exports = logger;
