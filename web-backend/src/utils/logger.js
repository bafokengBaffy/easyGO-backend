const fs = require('fs');
const path = require('path');

const logFilePath = process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/app.log');
const logLevel = process.env.LOG_LEVEL || 'info';

function log(message, level = 'info') {
  if (shouldLog(level)) {
    const logEntry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(logEntry.trim());
    }
  }
}

function shouldLog(level) {
  const levels = ['error', 'warn', 'info', 'debug'];
  return levels.indexOf(level) <= levels.indexOf(logLevel);
}

module.exports = {
  log,
};
