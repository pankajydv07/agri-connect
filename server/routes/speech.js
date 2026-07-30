const express = require('express');
const { transcribe, speak } = require('../controllers/speech');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');
const { audioUpload } = require('../middleware/upload');

const router = express.Router();

// Both endpoints were previously mounted unauthenticated directly on `app`,
// letting anonymous callers spend the project's Google Cloud quota.
router.post('/transcribe', protect, aiLimiter, audioUpload.single('audio'), transcribe);
router.post('/speak', protect, aiLimiter, validate(schemas.speak), speak);

module.exports = router;
