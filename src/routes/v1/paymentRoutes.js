const express = require('express');
const { body, param, query } = require('express-validator');
const { auth } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const paymentController = require('../../controllers/paymentController');
const mobileMoneyController = require('../../controllers/mobileMoneyController');

const router = express.Router();

// Validation rules
const validateMobileMoneyPayment = [
  body('phoneNumber').exists().withMessage('phoneNumber is required').isString(),
  body('amount').exists().withMessage('amount is required').isFloat({ gt: 0 }),
  body('provider').exists().withMessage('provider is required (MPESA or ECOCASH)').isString(),
  body('ride_id').optional().isInt(),
  body('reference').optional().isString(),
  body('accountReference').optional().isString(),
  body('description').optional().isString(),
  body('metadata').optional().isObject()
];

const validatePayout = [
  body('phoneNumber').exists().withMessage('phoneNumber is required').isString(),
  body('amount').exists().withMessage('amount is required').isFloat({ gt: 0 }),
  body('commandId').optional().isString(),
  body('remarks').optional().isString(),
  body('occasion').optional().isString()
];

const validateReversal = [
  body('transactionId').exists().withMessage('transactionId is required').isString(),
  body('reason').optional().isString()
];

const validatePaymentStatus = [
  query('provider').exists().withMessage('provider is required').isString(),
  query('transactionId').exists().withMessage('transactionId is required').isString(),
  query('providerTransactionId').optional().isString()
];

// ==================== Payment CRUD Operations ====================
router.get('/', auth, paymentController.list);
router.get('/:id', auth, paymentController.getPaymentById);
router.post('/', auth, paymentController.create);
router.put('/:id/status', auth, authorizeRoles('admin'), paymentController.updatePaymentStatus);
router.delete('/:id', auth, authorizeRoles('admin'), paymentController.deletePayment);

// ==================== Mobile Money Payment Endpoints ====================
// Main unified payment initiation
router.post('/mobile-money/initiate', auth, validateMobileMoneyPayment, paymentController.initiateMobilePayment);

// Provider-specific endpoints (using mobileMoneyController)
router.post('/mobile-money/mpesa/initiate', auth, validateMobileMoneyPayment, mobileMoneyController.initiateMpesaPayment); // Specific M-Pesa initiation
router.post('/mobile-money/ecocash/initiate', auth, validateMobileMoneyPayment, mobileMoneyController.initiateEcoCashPayment); // Specific EcoCash initiation

// Payment status query
router.get('/mobile-money/status/:provider/:transactionId', auth, mobileMoneyController.queryPaymentStatus);
router.get('/status', auth, validatePaymentStatus, mobileMoneyController.queryPaymentStatus); 

// Payout operations (admin/finance only)
router.post('/mobile-money/mpesa/payout', auth, authorizeRoles('admin', 'finance'), validatePayout, mobileMoneyController.processMpesaPayout);

// Reversal operations (admin/finance only)
router.post('/mobile-money/reverse', auth, authorizeRoles('admin', 'finance'), validateReversal, mobileMoneyController.reverseTransaction);

// Transaction history
router.get('/mobile-money/history', auth, mobileMoneyController.getTransactionHistory);

// ==================== Webhook Endpoints (No Auth - Called by Payment Providers) ====================
router.post('/webhook/mpesa', mobileMoneyController.mpesaWebhook); // Corrected to use mobileMoneyController
router.post('/webhook/ecocash', mobileMoneyController.ecocashWebhook); // Corrected to use mobileMoneyController

module.exports = router;