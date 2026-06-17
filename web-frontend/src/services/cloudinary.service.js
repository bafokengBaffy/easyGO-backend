import axios from 'axios';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/easygo-platform/image/upload`;
const UPLOAD_PRESET = 'easygo_production'; 

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url; // Returns the public URL
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image to production storage');
  }
};