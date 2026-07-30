const express = require('express');
const { analyse } = require('../controllers/pest');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');
const { imageAnalysisUpload } = require('../middleware/upload');

const router = express.Router();

// Behind the AI limiter: each analysis is a paid vision-model call.
// Multer runs before validation so the text fields are populated on req.body.
router.post(
  '/',
  protect,
  aiLimiter,
  imageAnalysisUpload.single('image'),
  validate(schemas.pestDetection),
  analyse
);

module.exports = router;
