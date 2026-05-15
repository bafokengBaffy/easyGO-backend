require('dotenv').config();
const http = require('http');
const app = require('./app');

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Web Backend server running on port ${port}`);
});
