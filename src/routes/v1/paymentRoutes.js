const express = require('express');
const { body } = require('express-validator');
const auth = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const controller = require('../../controllers/paymentController');
const mobileMoneyController = require('../../controllers/mobileMoneyController');

const router = express.Router();

const validateMobileMoneyPayment = [
  body('phoneNumber').exists().withMessage('phoneNumber is required').isString(),
  body('amount').exists().withMessage('amount is required').isFloat({ gt: 0 }),
  body('description').optional().isString(),
  body('reference').optional().isString(),
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

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);

router.post('/mobile-money/mpesa/initiate', auth, validateMobileMoneyPayment, mobileMoneyController.initiateMpesaPayment);
router.post('/mobile-money/ecocash/initiate', auth, validateMobileMoneyPayment, mobileMoneyController.initiateEcoCashPayment);
router.get('/mobile-money/status/:provider/:transactionId', auth, mobileMoneyController.queryPaymentStatus);
router.post('/mobile-money/mpesa/payout', auth, authorizeRoles('admin', 'finance'), validatePayout, mobileMoneyController.processMpesaPayout);
router.post('/mobile-money/reverse', auth, authorizeRoles('admin', 'finance'), validateReversal, mobileMoneyController.reverseTransaction);
router.get('/mobile-money/history', auth, mobileMoneyController.getTransactionHistory);

module.exports = router;
