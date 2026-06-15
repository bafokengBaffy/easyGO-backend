// Database configuration with connection pooling and retry logic
const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  config.DATABASE.database,
  config.DATABASE.username,
  config.DATABASE.password,
  {
    host: config.DATABASE.host,
    port: config.DATABASE.port,
    dialect: config.DATABASE.dialect,
    logging: (msg) => logger.debug(msg),
    pool: config.DATABASE.pool,
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/
      ],
      backoffBase: 1000,
      backoffExponent: 1.5
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
      freezeTableName: true
    }
  }
);

module.exports = { sequelize };
