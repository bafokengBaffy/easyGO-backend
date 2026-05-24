const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./src/models');

const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

(async () => {
  try {
    await connectDatabase();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database init warning:', error.message);
  }

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Web Backend server running on port ${port}`);
  });
})();
