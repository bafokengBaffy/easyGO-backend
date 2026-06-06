const express = require('express');
const controller = require('../../controllers/webhookController');

const router = express.Router();
router.post('/', controller.receive);

module.exports = router;
