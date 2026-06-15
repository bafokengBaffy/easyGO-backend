const express = require('express');
const auth = require('../../middleware/auth');
const controller = require('../../controllers/reviewController');

const router = express.Router();
router.get('/', auth, controller.list);
router.post('/', auth, controller.create);

module.exports = router;
