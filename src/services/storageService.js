const { uploadBufferToCloudinary } = require('../utils/fileUpload');
const ApiError = require('../utils/apiError');

const uploadFile = async (file, folder = 'easygo/uploads') => {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'Invalid file upload.');
  }

  return uploadBufferToCloudinary(file.buffer, folder);
};

module.exports = { uploadFile };
