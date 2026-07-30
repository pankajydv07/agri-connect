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

/**
 * Two paths on purpose. This router is mounted at both `/api/speech` and
 * `/api/speak`; the client posts directly to `/api/speak`, which resolves to
 * '/' here. Without the '/' entry that call 404s.
 */
router.post(['/speak', '/'], protect, aiLimiter, validate(schemas.speak), speak);

module.exports = router;
