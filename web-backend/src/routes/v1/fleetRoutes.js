const express = require('express');
const auth = require('../../middleware/auth');
const controller = require('../../controllers/fleetController');

const router = express.Router();
router.get('/', auth, controller.list);

module.exports = router;
