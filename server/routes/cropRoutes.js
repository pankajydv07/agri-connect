const express = require('express');
const { getCropRecommendation } = require('../controllers/cropController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// `protect` is new: this endpoint was completely open, so anyone could spend the
// project's LLM credits without an account.
router.post(
  '/recommend',
  protect,
  aiLimiter,
  validate(schemas.cropRecommendation),
  getCropRecommendation
);

module.exports = router;
