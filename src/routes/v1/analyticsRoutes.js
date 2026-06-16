const express = require('express');
const { auth } = require('../../middleware/auth');
const controller = require('../../controllers/analyticsController');

const router = express.Router();
router.get('/summary', auth, controller.summary);

module.exports = router;
