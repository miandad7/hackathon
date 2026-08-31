const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary from process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a local file or buffer to Cloudinary
 * @param {string} filePath - Absolute path to local file saved by multer
 * @returns {Promise<string>} - The Cloudinary secure_url or local upload fallback URL
 */
const uploadToCloudinary = async (filePath) => {
  const isCloudinaryConfigured =
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'citizen_complaints',
        resource_type: 'auto'
      });

      // Optionally clean up local temp file after successful upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error.message);
      // Fallback to local upload URL if Cloudinary upload fails
    }
  }

  // Fallback to local upload relative path
  const filename = filePath.split('/').pop();
  return `/uploads/${filename}`;
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
