const multer = require('multer');
const { uploadBuffer } = require('../adapters/storage.adapter');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE || 5 * 1024 * 1024),
  },
});

const uploadBufferToCloudinary = (fileBuffer, folder = 'easygo/uploads') => uploadBuffer(fileBuffer, folder);

module.exports = {
  upload,
  uploadBufferToCloudinary,
};
