const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const validate = require('../../middleware/validate');
const authValidation = require('../../middleware/auth.validation');

// Public routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);

module.exports = router;