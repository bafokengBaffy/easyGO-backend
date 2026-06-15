const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');

const securityMiddleware = (app) => {
  // Set security HTTP headers (OWASP)
  app.use(helmet());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Rate limiting (Brute force protection)
  app.use('/api/v1/auth', rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts, please try again in 15 minutes'
  }));
};

module.exports = securityMiddleware;