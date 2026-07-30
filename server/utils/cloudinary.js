/**
 * Cloudinary client.
 *
 * This file used to be zero bytes while `controllers/products.js` did
 * `require('../utils/cloudinary')` and then called `cloudinary.uploader.upload`
 * — so every product image upload threw "Cannot read properties of undefined".
 * The real configuration lived in `cloudConfig.js` and was never imported.
 * There is now exactly one configured client, here.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

if (env.cloudinary.configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/**
 * Streams uploads straight to Cloudinary. The old flow wrote each file to a
 * local `uploads/` directory and never deleted it, leaking disk on every
 * upload and losing images entirely on container restart.
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'agri-connect/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

const assertConfigured = () => {
  if (!env.cloudinary.configured) {
    throw new AppError('Image upload is not configured on this server', 503);
  }
};

const destroy = async (publicId) => {
  if (!publicId || !env.cloudinary.configured) return;
  await cloudinary.uploader.destroy(publicId);
};

/**
 * Recovers the Cloudinary public id from a stored secure_url so an image can be
 * deleted along with its product instead of orphaning paid storage forever.
 */
const publicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

module.exports = { cloudinary, storage, assertConfigured, destroy, publicIdFromUrl };
