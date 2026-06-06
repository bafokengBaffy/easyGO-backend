const morgan = require('morgan');
const logger = require('../config/logger');

const format = process.env.MORGAN_FORMAT || 'combined';

module.exports = morgan(format, { stream: logger.stream });
