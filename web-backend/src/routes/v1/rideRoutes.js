const express = require('express');
const auth = require('../../middleware/auth');
const rideController = require('../../controllers/rideController');

const router = express.Router();
router.get('/', auth, rideController.list);
router.post('/', auth, rideController.create);
router.patch('/:id/status', auth, rideController.updateStatus);

module.exports = router;
