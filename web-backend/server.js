﻿﻿﻿/**
 * Production-ready server.js for EasyGO Backend
 * Features: Graceful shutdown, cluster mode, health checks, monitoring
 * @version 2.0.0
 */

const app = require('./app');
const config = require('./src/config');
const dbConfig = require('./src/config/database');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/models');
const os = require('os');
const cluster = require('cluster');
const https = require('https');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const { connectRedis } = require('./src/config/redis');
const socketService = require('./src/services/socketService');

// Force console output for critical messages
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function(...args) {
  originalConsoleLog.apply(console, [`[${new Date().toISOString()}]`, ...args]);
};

console.error = function(...args) {
  originalConsoleError.apply(console, [`[${new Date().toISOString()}] [ERROR]`, ...args]);
};

console.log('='.repeat(80));
console.log('🚀 Starting EasyGO Backend Server...');
console.log(`📂 Current directory: ${process.cwd()}`);
console.log(`🖥️  Node version: ${process.version}`);
console.log(`💻 Platform: ${process.platform}`);
console.log('='.repeat(80));

// ==================== CONFIGURATION ====================
const PORT = config.PORT || 3000;
const HOST = config.HOST || '0.0.0.0';
const ENVIRONMENT = config.NODE_ENV || 'development';
const CLUSTER_MODE = config.CLUSTER_MODE !== false && ENVIRONMENT === 'production';
const NUM_WORKERS = config.WORKERS || Math.max(2, os.cpus().length);

// SSL Configuration
const SSL_ENABLED = config.SSL_ENABLED === true;
let sslOptions = null;

if (SSL_ENABLED) {
    try {
        sslOptions = {
            key: fs.readFileSync(config.SSL_KEY_PATH || '/etc/ssl/private/server.key'),
            cert: fs.readFileSync(config.SSL_CERT_PATH || '/etc/ssl/certs/server.crt'),
            ca: config.SSL_CA_PATH ? fs.readFileSync(config.SSL_CA_PATH) : null,
            rejectUnauthorized: config.SSL_REJECT_UNAUTHORIZED !== false,
        };
        logger.info('SSL certificates loaded successfully');
    } catch (error) {
        logger.error('Failed to load SSL certificates:', error.message);
        if (ENVIRONMENT === 'production') {
            process.exit(1);
        }
    }
}

// ==================== CLUSTER MODE ====================
if (CLUSTER_MODE && cluster.isPrimary) {
    // Primary process - manages workers
    logger.info(`Starting primary process (PID: ${process.pid})`);
    logger.info(`Environment: ${ENVIRONMENT}`);
    logger.info(`Node version: ${process.version}`);
    logger.info(`Platform: ${process.platform}`);
    logger.info(`Spawning ${NUM_WORKERS} worker(s)...`);

    // Fork workers
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }

    // Handle worker crashes
    cluster.on('exit', (worker, code, signal) => {
        logger.error(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
        
        // Restart worker after delay to prevent rapid respawn
        setTimeout(() => {
            logger.info(`Restarting worker...`);
            cluster.fork();
        }, 5000);
    });

    // Handle worker online event
    cluster.on('online', (worker) => {
        logger.info(`Worker ${worker.process.pid} is online`);
    });

    // Handle worker messages
    cluster.on('message', (worker, message) => {
        if (message === 'ready') {
            logger.info(`Worker ${worker.process.pid} is ready`);
        }
    });

    // Graceful shutdown for primary
    const shutdownPrimary = async (signal) => {
        logger.info(`Primary received ${signal}, shutting down workers...`);
        
        const workers = Object.values(cluster.workers);
        let exited = 0;
        
        if (workers.length === 0) {
            logger.info('No workers to shutdown, exiting');
            process.exit(0);
        }
        
        workers.forEach((worker) => {
            worker.on('exit', () => {
                exited++;
                logger.info(`Worker ${worker.process.pid} exited (${exited}/${workers.length})`);
                if (exited === workers.length) {
                    logger.info('All workers exited, primary shutting down');
                    process.exit(0);
                }
            });
            
            // Send shutdown message to worker
            worker.send({ type: 'shutdown', signal });
            worker.disconnect();
            
            // Force kill after timeout
            setTimeout(() => {
                if (!worker.isDead()) {
                    logger.warn(`Force killing worker ${worker.process.pid}`);
                    worker.kill('SIGKILL');
                }
            }, 10000);
        });
        
        // Force shutdown after timeout
        setTimeout(() => {
            logger.error('Force shutdown after timeout');
            process.exit(1);
        }, 15000);
    };

    process.on('SIGTERM', () => shutdownPrimary('SIGTERM'));
    process.on('SIGINT', () => shutdownPrimary('SIGINT'));
    process.on('SIGQUIT', () => shutdownPrimary('SIGQUIT'));

} else {
    // Worker process - runs the actual server
    startServer();
}

// ==================== SERVER INITIALIZATION ====================
async function startServer() {
    let server = null;
    let isShuttingDown = false;
    console.log('[STARTUP] Initializing server...');

    try {
        // Validate critical environment variables
        console.log('[STARTUP] Loading configuration...');
        validateEnvironment();
        
        // Display which database we're using
        console.log('='.repeat(60));
        console.log('🚀 EasyGo Backend Starting...');
        console.log(`📦 Database Mode: ${dbConfig.isRemote ? 'REMOTE' : 'LOCAL'}`);
        console.log(`📍 Database Host: ${dbConfig.config.host}`);
        console.log(`💾 Database Name: ${dbConfig.config.database}`);
        console.log('='.repeat(60));

        // Test database connection (can be skipped with SKIP_DB_CHECK=true)
        console.log('[STARTUP] Connecting to database...');
        if (process.env.SKIP_DB_CHECK === 'true') {
            logger.warn('SKIP_DB_CHECK=true, skipping database and redis initialization');
        } else {
            await dbConfig.testConnection(sequelize);
            console.log('[STARTUP] ✅ Database connected');

            // Connect Redis
            console.log('[STARTUP] Connecting to Redis...');
            await connectRedis();
            console.log('[STARTUP] ✅ Redis connected');
            
            // Sync database schema (only in development)
            if (ENVIRONMENT === 'development') {
                await sequelize.sync({ alter: true });
                logger.info('Database schema synchronized');
            } else if (ENVIRONMENT === 'production') {
                await sequelize.authenticate();
                logger.info('Database connection verified');
            }
        }
        
        // Start HTTP/HTTPS server
        if (SSL_ENABLED && sslOptions) {
            server = https.createServer(sslOptions, app);
            logger.info('HTTPS server configured');
        } else {
            server = http.createServer(app);
            logger.info('HTTP server configured');
        }

        // Initialize WebSockets
        const io = new Server(server, {
            cors: {
                origin: config.CORS_ORIGINS || '*',
                methods: ['GET', 'POST']
            }
        });
        socketService.init(io);
        
        // Server timeout configuration
        server.timeout = config.SERVER_TIMEOUT || 120000; // 2 minutes
        server.keepAliveTimeout = config.KEEP_ALIVE_TIMEOUT || 65000;
        server.headersTimeout = config.HEADERS_TIMEOUT || 66000;
        server.maxHeadersCount = config.MAX_HEADERS_COUNT || 2000;
        
        // Start listening
        const listEndpoints = require('express-list-endpoints');
        const endpoints = listEndpoints(app);

        server.listen(PORT, HOST, () => {
            const protocol = SSL_ENABLED && sslOptions ? 'https' : 'http';

            console.log('='.repeat(60));
            console.log(`✅ SERVER STARTED SUCCESSFULLY!`);
            console.log(`📍 URL: ${protocol}://${HOST}:${PORT}`);
            console.log(`🌍 Environment: ${ENVIRONMENT}`);
            console.log(`🔑 Process ID: ${process.pid}`);
            console.log(`🛠️  Endpoints registered: ${endpoints.length}`);
            console.log('='.repeat(60));

            endpoints.forEach(route => {
                logger.info(`[${route.methods.join(',')}] ${route.path}`);
            });
            logger.info('='.repeat(60));
            
            // Send ready signal to primary if in cluster mode
            if (CLUSTER_MODE && cluster.worker) {
                process.send('ready');
            }
        });
        
        // ==================== GRACEFUL SHUTDOWN ====================
        const shutdown = async (signal) => {
            if (isShuttingDown) {
                logger.warn('Shutdown already in progress');
                return;
            }
            
            isShuttingDown = true;
            logger.info(`${signal} received, starting graceful shutdown...`);
            
            // Set timeout for force shutdown
            const forceShutdownTimeout = setTimeout(() => {
                logger.error('Force shutdown after timeout');
                process.exit(1);
            }, 30000);
            
            try {
                // Stop accepting new connections
                await new Promise((resolve) => {
                    server.close(() => {
                        logger.info('HTTP server closed, no new connections accepted');
                        resolve();
                    });
                });
                
                // Set server timeout for existing connections
                server.setTimeout(10000, (socket) => {
                    logger.warn('Forcing socket disconnect after timeout');
                    socket.destroy();
                });
                
                // Close database connections
                try {
                    await sequelize.close();
                    logger.info('Database connections closed');
                } catch (dbError) {
                    logger.error('Error closing database:', dbError);
                }
                
                // Close Redis connection if configured
                if (config.REDIS_URL) {
                    try {
                        const { redisClient } = require('./src/config/redis');
                        if (redisClient && redisClient.quit) {
                            await redisClient.quit();
                            logger.info('Redis connection closed');
                        }
                    } catch (redisError) {
                        logger.error('Error closing Redis:', redisError);
                    }
                }
                
                clearTimeout(forceShutdownTimeout);
                logger.info('Graceful shutdown completed');
                process.exit(0);
                
            } catch (error) {
                logger.error('Error during shutdown:', error);
                clearTimeout(forceShutdownTimeout);
                process.exit(1);
            }
        };
        
        // Register shutdown handlers
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGQUIT', () => shutdown('SIGQUIT'));
        
        // Handle worker shutdown message (cluster mode)
        process.on('message', (msg) => {
            if (msg && msg.type === 'shutdown') {
                shutdown(msg.signal || 'SIGTERM');
            }
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', reason);
            shutdown('UNHANDLED_REJECTION');
        });
        
    } catch (error) {
        console.error('[STARTUP] ❌ FATAL ERROR:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate critical environment variables
 */
function validateEnvironment() {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    
    const missing = [];
    
    for (const envVar of requiredVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }
    
    if (missing.length > 0) {
        logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        
        if (ENVIRONMENT === 'production') {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        } else {
            logger.warn('Running in development with missing variables may cause issues');
        }
    }
    
    // Validate JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32 && ENVIRONMENT === 'production') {
        logger.warn('JWT_SECRET is too short (< 32 characters) - security risk!');
    }
    
    // Log configuration (without secrets)
    logger.info('Environment validated successfully');
    logger.info(`Node.js version: ${process.version}`);
    logger.info(`Platform: ${process.platform}`);
    logger.info(`Memory limit: ${config.MAX_MEMORY || 'default'} MB`);
}

/**
 * Connect to database with retry logic
 */
async function connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            await sequelize.authenticate();
            logger.info(`Database connected successfully (attempt ${i + 1}/${retries})`);
            return;
        } catch (error) {
            logger.error(`Database connection failed (attempt ${i + 1}/${retries}):`, error.message);
            
            if (i === retries - 1) {
                throw new Error(`Failed to connect to database after ${retries} attempts: ${error.message}`);
            }
            
            logger.info(`Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Exponential backoff
            delay = Math.min(delay * 1.5, 30000);
        }
    }
}

// ==================== MONITORING & METRICS ====================

// Memory usage monitoring
if (ENVIRONMENT === 'production') {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);
        
        // Log warning if memory usage is high
        if (heapUsedMB > 500) {
            logger.warn(`High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (RSS: ${rssMB}MB)`);
        }
        
        // For debugging
        if (process.env.DEBUG_MEMORY === 'true') {
            logger.debug(`Memory: Heap=${heapUsedMB}/${heapTotalMB}MB, RSS=${rssMB}MB`);
        }
    }, 60000); // Every minute
}

// Export for testing
module.exports = { startServer, validateEnvironment };