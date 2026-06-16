/**
 * User Routes - Production Ready
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const { auth } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validate = require('../../middleware/validate');
const authValidation = require('../../middleware/auth.validation');

// Public routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);

// Protected routes
router.use(auth); // Apply authentication to all routes below

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/profile', userController.deleteAccount);
router.get('/rides', userController.getRideHistory);
router.get('/payments', userController.getPaymentHistory);
router.post('/change-password', userController.changePassword);

// Admin only routes
router.use(authorizeRoles('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/suspend', userController.suspendUser);
router.patch('/:id/activate', userController.activateUser);

// Health check for user routes
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    endpoint: '/api/v1/users',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;