const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Initiate Mobile Money Payment (M-Pesa / EcoCash)
router.post('/initiate', paymentController.initiateMobilePayment);
router.get('/status', paymentController.checkStatus);

module.exports = router;