const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

/**
 * Global Jest Setup
 * Handles database synchronization and connection management for integration tests.
 */

beforeAll(async () => {
  try {
    // Allow skipping DB sync in CI when a real DB is unavailable
    if (process.env.SKIP_DB_CHECK === 'true') {
      logger.info('SKIP_DB_CHECK set — skipping test DB sync');
      return;
    }

    // Force sync database to ensure a clean schema for tests
    await sequelize.sync({ force: true });
  } catch (error) {
    logger.error('Test DB Sync Error:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Close database connection to allow Jest to exit gracefully
  await sequelize.close();
});

// You can add global mocks or environment overrides here