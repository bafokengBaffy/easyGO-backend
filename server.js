// Production-ready server.js
const app = require('./app');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const { sequelize } = require('./src/models');

const PORT = config.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected');
    
    await sequelize.sync({ alter: config.NODE_ENV === 'development' });
    
    const server = app.listen(PORT, () => {
      logger.info(🚀 Server running on port );
      logger.info(📚 API Docs: http://localhost:/api-docs);
      logger.info(🌍 Environment: );
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, closing server...');
      server.close(() => {
        sequelize.close();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
