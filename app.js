/**
 * Production-ready Express App for EasyGO Backend
 * @version 2.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express app
const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Set security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Enable CORS with specific options
const corsOptions = {
    origin: config.CORS_ORIGINS || '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Correlation-ID'],
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'limit', 'page', 'sort', 'fields', 'search',
        'lat', 'lng', 'radius', 'minPrice', 'maxPrice'
    ]
}));

// Compression middleware
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// ==================== RATE LIMITING ====================

// General API rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
    },
    skip: (req) => {
        // Skip rate limiting for health checks and metrics
        return req.path === '/health' || req.path === '/metrics';
    }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiters
app.use('/api', limiter);
app.use('/api/v1/auth', authLimiter);

// ==================== REQUEST LOGGING & TRACKING ====================

// Add request ID and correlation ID
app.use((req, res, next) => {
    req.requestId = require('uuid').v4();
    req.correlationId = req.headers['x-correlation-id'] || req.requestId;
    res.setHeader('X-Request-ID', req.requestId);
    res.setHeader('X-Correlation-ID', req.correlationId);
    next();
});

// Request logging
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        
        logger[logLevel]({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            requestId: req.requestId,
            correlationId: req.correlationId,
            userAgent: req.get('user-agent'),
        }, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// ==================== HEALTH CHECK ENDPOINTS ====================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
        requestId: req.requestId,
        version: require('./package.json').version,
    });
});

app.get('/health/live', (req, res) => {
    // Liveness probe - basic check
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
    // Readiness probe - check dependencies
    const checks = await performHealthChecks();
    
    if (checks.allPassed) {
        res.status(200).json({ status: 'ready', checks });
    } else {
        res.status(503).json({ status: 'not ready', checks });
    }
});

async function performHealthChecks() {
    const checks = {
        database: false,
        redis: false,
        allPassed: false,
        timestamp: new Date().toISOString(),
    };
    
    try {
        // Check database connection
        const { sequelize } = require('./src/models');
        await sequelize.authenticate();
        checks.database = true;
    } catch (error) {
        logger.error('Database health check failed:', error.message);
    }
    
    try {
        // Check Redis connection if configured
        if (config.REDIS_URL) {
            const { redisClient } = require('./src/config/redis');
            if (redisClient && redisClient.isReady) {
                checks.redis = true;
            } else {
                logger.warn('Redis not ready');
            }
        } else {
            checks.redis = true; // Redis not required
        }
    } catch (error) {
        logger.error('Redis health check failed:', error.message);
    }
    
    checks.allPassed = checks.database && checks.redis;
    return checks;
}

// ==================== METRICS ENDPOINT ====================

app.get('/metrics', async (req, res) => {
    try {
        const client = require('prom-client');
        const metrics = await client.register.metrics();
        res.set('Content-Type', client.register.contentType);
        res.end(metrics);
    } catch (error) {
        logger.error('Metrics generation failed:', error);
        res.status(500).json({ error: 'Failed to generate metrics' });
    }
});

// ==================== API ROUTES ====================

// API documentation
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument);
});

// Version endpoint
app.get('/api/version', (req, res) => {
    res.json({
        version: require('./package.json').version,
        environment: config.NODE_ENV,
        apiVersion: 'v1',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/v1/auth', require('./src/routes/v1/authRoutes'));
app.use('/api/v1/users', require('./src/routes/v1/userRoutes'));
app.use('/api/v1/rides', require('./src/routes/v1/rideRoutes'));
app.use('/api/v1/drivers', require('./src/routes/v1/driverRoutes'));
app.use('/api/v1/payments', require('./src/routes/v1/paymentRoutes'));
app.use('/api/v1/admin', require('./src/routes/v1/adminRoutes'));

// ==================== STATIC FILES ====================

// Serve static files in production
if (config.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, 'public');
    app.use(express.static(staticPath));
    
    // SPA fallback for client-side routing
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            next();
        } else {
            res.sendFile(path.join(staticPath, 'index.html'));
        }
    });
}

// ==================== ERROR HANDLING ====================

// Catch-all for undefined routes
app.use((req, res, next) => {
    const err = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
});

// Global error handler
app.use(errorHandler);

module.exports = app;