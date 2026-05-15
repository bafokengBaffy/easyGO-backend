const express = require('express');
const { getProfile } = require('../../controllers/userController');

const router = express.Router();

router.get('/profile', getProfile);

module.exports = router;
