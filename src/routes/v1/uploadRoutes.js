const express = require('express');
const auth = require('../../middleware/auth');
const { upload } = require('../../utils/fileUpload');
const uploadController = require('../../controllers/uploadController');

const router = express.Router();

router.post('/', auth, upload.single('file'), uploadController.upload);

module.exports = router;
