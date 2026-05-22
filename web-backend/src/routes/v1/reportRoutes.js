const express = require('express');
const auth = require('../../middleware/auth');
const controller = require('../../controllers/reportController');

const router = express.Router();
router.get('/', auth, controller.list);

module.exports = router;
