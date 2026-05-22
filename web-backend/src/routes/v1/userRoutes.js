const express = require('express');
const auth = require('../../middleware/auth');
const { getProfile, list } = require('../../controllers/userController');

const router = express.Router();

router.get('/', auth, list);
router.get('/profile', auth, getProfile);

module.exports = router;
