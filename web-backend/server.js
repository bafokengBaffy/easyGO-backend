require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDatabase } = require('./src/models');

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
