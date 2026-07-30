const axios = require('axios');
const env = require('../config/env');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const SYSTEM_PROMPT =
  'You are an expert agricultural advisor with deep knowledge of crop selection, farming ' +
  "practices, and local agricultural conditions. Provide detailed, practical recommendations " +
  "tailored to the farmer's specific situation.";

const buildPrompt = (input) => {
  const lines = [
    'Provide a detailed crop recommendation for a farm with the following characteristics:',
    `- Location: ${input.location}`,
    `- Season: ${input.season}`,
    `- Soil Type: ${input.soil}`,
  ];

  if (input.previousCrops) lines.push(`- Previous Crops: ${input.previousCrops}`);
  if (input.irrigationAvailable) lines.push(`- Irrigation: ${input.irrigationAvailable}`);
  if (input.landSize) lines.push(`- Land Size: ${input.landSize} acres`);
  if (input.soilPh) lines.push(`- Soil pH: ${input.soilPh}`);
  if (input.farmingExperience) lines.push(`- Farmer Experience Level: ${input.farmingExperience}`);

  lines.push(
    '',
    'Please provide:',
    '1. Top 3 recommended crops with reasons',
    '2. Expected yield per acre',
    '3. Required irrigation and fertilizer needs',
    '4. Potential challenges and mitigation strategies',
    '5. Crop rotation suggestions based on previous crops (if provided)',
    "6. Additional tips based on the farmer's experience level"
  );

  return lines.join('\n');
};

// @desc    Get an AI crop recommendation
// @route   POST /api/crop/recommend
// @access  Private
const getCropRecommendation = asyncHandler(async (req, res) => {
  // The bearer token used to be a hardcoded string literal in this file, valid
  // until 2030, committed to a public repository.
  if (!env.nebius.configured) {
    throw new AppError('Crop recommendation is not configured on this server', 503);
  }

  const prompt = buildPrompt(req.body);

  let response;
  try {
    response = await axios.post(
      `${env.nebius.baseUrl}/chat/completions`,
      {
        model: env.nebius.model,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.nebius.apiKey}`,
        },
        timeout: 30000,
      }
    );
  } catch (error) {
    // Log the provider's response for us; return something actionable to the user.
    logger.error(
      { err: error, status: error.response?.status, body: error.response?.data },
      'Nebius crop recommendation request failed'
    );

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new AppError('The recommendation service timed out — please try again', 504);
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new AppError('Crop recommendation service rejected our credentials', 502);
    }
    if (error.response?.status === 429) {
      throw new AppError('Recommendation service is rate limited — please try again shortly', 429);
    }
    throw new AppError('Failed to fetch a crop recommendation — please try again later', 502);
  }

  const recommendation = response.data?.choices?.[0]?.message?.content;

  if (!recommendation) {
    logger.error({ body: response.data }, 'Unexpected Nebius response shape');
    throw new AppError('Received an invalid response from the recommendation service', 502);
  }

  // `recommendation` is kept for backwards compatibility with the existing
  // client; `data` matches the response envelope used everywhere else.
  res.status(200).json({ success: true, data: { recommendation }, recommendation });
});

module.exports = { getCropRecommendation };
