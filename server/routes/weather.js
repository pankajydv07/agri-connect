const express = require('express');
const { getForecast } = require('../controllers/weather');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// Authenticated, but not behind the AI limiter: Open-Meteo is free and the
// results are cached server-side, so this is far cheaper than an LLM call.
router.get('/', protect, validate(schemas.weatherQuery, 'query'), getForecast);

module.exports = router;
