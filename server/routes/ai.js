const express = require('express');
const { chat } = require('../controllers/ai');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Every AI call costs money at the provider, so this is authenticated and
// rate limited per user rather than per IP.
router.post('/chat', protect, aiLimiter, validate(schemas.aiChat), chat);

module.exports = router;
