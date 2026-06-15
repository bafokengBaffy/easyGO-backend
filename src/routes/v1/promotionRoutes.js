const express = require('express');
const { auth } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const controller = require('../../controllers/promotionController');

const router = express.Router();

router.get('/', auth, controller.list);
router.get('/:id', auth, controller.getById);

// Administrative operations
router.post('/', auth, authorizeRoles('admin'), controller.create);
router.patch('/:id', auth, authorizeRoles('admin'), controller.update);
router.delete('/:id', auth, authorizeRoles('admin'), controller.delete);

module.exports = router;
