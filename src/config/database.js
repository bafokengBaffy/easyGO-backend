const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'easygo_web_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: Number(process.env.DB_POOL_MAX || 20),
      min: Number(process.env.DB_POOL_MIN || 2),
      acquire: 60000,
      idle: 10000,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
    },
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true } } : {},
  },
);

module.exports = sequelize;
