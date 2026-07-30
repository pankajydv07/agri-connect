/**
 * Upload middleware.
 *
 * Consolidates what used to be three overlapping multer instances
 * (`middleware/multer.js`, `middleware/upload.js`, and an inline config in
 * `server.js`) with different filters and no single source of truth.
 *
 * Product images stream directly to Cloudinary; audio is held in memory and
 * handed to Google Cloud Speech, so nothing is ever written to local disk.
 */

const multer = require('multer');
const env = require('../config/env');
const { storage } = require('../utils/cloudinary');

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const AUDIO_MIME_PREFIXES = ['audio/', 'video/webm'];

const imageFilter = (req, file, cb) => {
  if (IMAGE_MIME_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
};

const audioFilter = (req, file, cb) => {
  // Browsers record as audio/webm or video/webm depending on the platform.
  if (AUDIO_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix))) {
    return cb(null, true);
  }
  return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'audio'));
};

const productImageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: audioFilter,
  limits: { fileSize: env.MAX_AUDIO_UPLOAD_BYTES, files: 1 },
});

/**
 * Images sent for AI analysis (pest detection).
 *
 * Memory storage, not Cloudinary: a diagnostic photo is transient input, not an
 * asset we want to store and pay for. It is base64-encoded straight into the
 * vision request and then discarded.
 */
const imageAnalysisUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
});

module.exports = { productImageUpload, audioUpload, imageAnalysisUpload };
