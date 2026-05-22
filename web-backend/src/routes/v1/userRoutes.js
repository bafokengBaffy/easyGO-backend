const express = require('express');
const auth = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const { getProfile, list, update } = require('../../controllers/userController');

const router = express.Router();

router.get('/', auth, authorizeRoles('admin', 'support'), list);
router.get('/profile', auth, getProfile);
router.patch('/:id', auth, authorizeRoles('admin'), update);

module.exports = router;
