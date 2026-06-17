/**
 * Database Configuration - Supports Local & Remote PostgreSQL
 * @version 1.0.0
 */

require('dotenv').config();

// Determine which environment to use
const ENV = process.env.NODE_ENV || 'development';
const USE_REMOTE_DB = process.env.USE_REMOTE_DB === 'true';

// Database configuration object
const databaseConfig = {
    local: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'easygo_dev',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '0595',
        dialect: 'postgres',
        logging: ENV === 'development' ? console.log : false,
        ssl: false,
        dialectOptions: {},
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 20,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
        },
        retry: {
            max: 5,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
            ],
            backoffBase: 1000,
            backoffExponent: 1.5,
        },
    },
    remote: {
        host: process.env.REMOTE_DB_HOST || process.env.DB_HOST,
        port: parseInt(process.env.REMOTE_DB_PORT) || parseInt(process.env.DB_PORT) || 5432,
        database: process.env.REMOTE_DB_NAME || process.env.DB_NAME,
        username: process.env.REMOTE_DB_USER || process.env.DB_USER,
        password: process.env.REMOTE_DB_PASSWORD || process.env.DB_PASSWORD,
        dialect: 'postgres',
        logging: false,
        ssl: process.env.DB_SSL === 'true',
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false,
            } : false,
        },
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 1,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
            evict: 1000,
            handleDisconnects: true
        },
        retry: {
            max: 3,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
            ],
            backoffBase: 1000,
            backoffExponent: 1.5,
        },
    },
};

let activeConfig = USE_REMOTE_DB ? databaseConfig.remote : databaseConfig.local;

if (process.env.DATABASE_URL) {
    const url = require('url').parse(process.env.DATABASE_URL);
    activeConfig = {
        ...activeConfig,
        host: url.hostname,
        port: url.port,
        database: url.pathname.slice(1),
        username: url.auth ? url.auth.split(':')[0] : activeConfig.username,
        password: url.auth ? url.auth.split(':')[1] : activeConfig.password,
    };
}

const buildDatabaseUrl = () => {
    const { username, password, host, port, database } = activeConfig;
    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
};

module.exports = {
    config: activeConfig,
    url: buildDatabaseUrl(),
    isRemote: USE_REMOTE_DB,
    environment: ENV,
    testConnection: async (sequelize) => {
        try {
            await sequelize.authenticate();
            console.log('✅ Database connection successful!');
            console.log(`   Host: ${activeConfig.host}:${activeConfig.port}`);
            console.log(`   Database: ${activeConfig.database}`);
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    },
};