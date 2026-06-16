const express = require('express');
const router = express.Router();
const rideController = require('../../controllers/rideController'); // Standard location
const { auth } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const rideValidation = require('../../middleware/ride.validation');

// Protect all ride routes
router.use(auth);

/**
 * @route POST /api/v1/rides/book
 */
router.post('/book', validate(rideValidation.bookRide), rideController.create);

// Other ride routes (list, status, cancel) would go here

module.exports = router;