const express = require('express');
const auth = require('../../middleware/auth');
const controller = require('../../controllers/driverController');

const router = express.Router();
router.get('/', auth, controller.list);
router.patch('/:id/online-status', auth, controller.setOnlineStatus);

module.exports = router;
