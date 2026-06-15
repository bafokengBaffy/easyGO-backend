const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const userController = require('../../controllers/userController'); // For general user listing/getting
const driverController = require('../../controllers/driver.controller'); // For general driver listing/getting
const { auth } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const auditAdminAction = require('../../middleware/audit.middleware'); // Import the new audit middleware
const pagination = require('../../middleware/pagination');

// All routes in this file require authentication, admin role, and will be audited
router.use(auth);
router.use(authorizeRoles('admin'));
router.use(auditAdminAction); // Apply audit logging to all admin actions

// Admin Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management (Admin actions)
router.get('/users', pagination(), adminController.getAllUsers); // Admin lists all users
router.get('/users/:id', userController.getProfile); // Admin views any user profile
router.patch('/users/:id', adminController.updateUserByAdmin); // Admin updates any user

// Driver Management (Admin actions)
router.get('/drivers', pagination(), driverController.listDrivers); // Admin lists all drivers
router.patch('/drivers/:id/status', adminController.updateDriverStatusByAdmin); // Admin updates any driver's online status

// Add other admin-specific routes here (e.g., managing promotions, incidents, reports)

module.exports = router;