const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Web Backend API is running' });
});

app.listen(port, () => {
  console.log(Web Backend server running on port );
});
