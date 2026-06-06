
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const routes = require('./src/routes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');
const helmet = require('./src/middleware/helmet');
const cors = require('./src/middleware/cors');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const logger = require('./src/utils/logger');
const featureFlags = require('./src/utils/featureFlags');
// const validation = require('./src/middleware/validation'); // Use in routes as needed

const app = express();

// Security headers
app.use(helmet);
// CORS
app.use(cors);
// Rate limiting (global, can also apply per route)
app.use(apiLimiter);
// Compression
app.use(compression());
// JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Logging
app.use(morgan('dev'));

// Log feature flags on startup
logger.log(`Feature flags: ${JSON.stringify(featureFlags)}`, 'info');


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'easygo-web-backend',
    message: 'EasyGo backend is running.',
    docs: '/api/v1',
    health: '/api/v1/health',
    featureFlags,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'easygo-web-backend',
    time: new Date().toISOString(),
  });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
