const express = require('express');
const healthRoutes = require('./v1/healthRoutes');
const authRoutes = require('./v1/authRoutes');
const userRoutes = require('./v1/userRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EasyGo Web Backend',
    version: '1.0.0',
  });
});

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
