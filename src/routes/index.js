const express = require('express');
const healthRoutes = require('./v1/healthRoutes');
const authRoutes = require('./v1/authRoutes');
const userRoutes = require('./v1/userRoutes');
const rideRoutes = require('./v1/rideRoutes');
const driverRoutes = require('./v1/driverRoutes');
const paymentRoutes = require('./v1/paymentRoutes');
const promotionRoutes = require('./v1/promotionRoutes');
const zoneRoutes = require('./v1/zoneRoutes');
const supportRoutes = require('./v1/supportRoutes');
const incidentRoutes = require('./v1/incidentRoutes');
const reviewRoutes = require('./v1/reviewRoutes');
const notificationRoutes = require('./v1/notificationRoutes');
const reportRoutes = require('./v1/reportRoutes');
const webhookRoutes = require('./v1/webhookRoutes');
const analyticsRoutes = require('./v1/analyticsRoutes');
const fleetRoutes = require('./v1/fleetRoutes');
const uploadRoutes = require('./v1/uploadRoutes');
const opsRoutes = require('../modules/ops');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

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
router.use('/rides', rideRoutes);
router.use('/drivers', driverRoutes);
router.use('/payments', paymentRoutes);
router.use('/promotions', promotionRoutes);
router.use('/zones', zoneRoutes);
router.use('/support', supportRoutes);
router.use('/incidents', incidentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/fleet', fleetRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ops', auth, authorizeRoles('admin', 'support', 'ops_manager'), opsRoutes);

module.exports = router;
