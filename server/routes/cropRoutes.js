const express = require('express');
const router = express.Router();
const { getCropRecommendation } = require('../controllers/cropController');

router.post('/recommend', getCropRecommendation);

module.exports = router; 