const { ok } = require('../utils/apiResponse');
const storageService = require('../services/storageService');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const result = await storageService.uploadFile(req.file);

    return ok(res, {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    }, 'File uploaded successfully.', 201);
  } catch (error) {
    return next(error);
  }
};
