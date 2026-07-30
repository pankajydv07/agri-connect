/**
 * AI crop recommendation.
 *
 * Previously this called Nebius with a bearer token written as a string literal
 * in this file — valid until 2030 and committed to a public repository. It now
 * goes through the shared Groq client.
 *
 * Note on quality: the Nebius model was a LoRA fine-tuned specifically for crop
 * recommendation. Groq serves general-purpose models only, so the prompt below
 * does more work to compensate — it pins the structure, demands local specifics,
 * and forbids the vague filler a general model tends to produce on this task.
 */

const { chatCompletion, firstMessage } = require('../utils/groq');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const SYSTEM_PROMPT = `You are an experienced agricultural advisor working with smallholder farmers in India.

Give practical, specific, actionable recommendations. Follow these rules:
- Recommend crops that are genuinely suited to the stated soil, season and region. Do not suggest a crop that cannot grow there.
- Give real numbers wherever you can: expected yield per acre, seed rate, irrigation frequency, fertiliser quantities.
- Use Indian units and terms the farmer will recognise (acre, quintal, kharif/rabi/zaid) and quote money in rupees.
- Where a recommendation depends on something you were not told, say what to check rather than assuming.
- Be honest about risk. If a crop is profitable but water-hungry in a low-rainfall district, say so.
- Do not pad the answer with generic advice that applies to every farm.`;

const buildPrompt = (input) => {
  const lines = [
    'Recommend crops for a farm with these characteristics:',
    `- Location: ${input.location}`,
    `- Season: ${input.season}`,
    `- Soil type: ${input.soil}`,
  ];

  if (input.previousCrops) lines.push(`- Previous crops: ${input.previousCrops}`);
  if (input.irrigationAvailable) lines.push(`- Irrigation: ${input.irrigationAvailable}`);
  if (input.landSize) lines.push(`- Land size: ${input.landSize} acres`);
  if (input.soilPh) lines.push(`- Soil pH: ${input.soilPh}`);
  if (input.farmingExperience) lines.push(`- Farmer experience: ${input.farmingExperience}`);

  lines.push(
    '',
    'Structure the answer with these markdown headings:',
    '## Top 3 Recommended Crops',
    'For each: why it suits this soil/season/region, expected yield per acre, and expected price range.',
    '## Irrigation and Fertiliser',
    '## Risks and How to Manage Them',
    '## Crop Rotation Advice',
    input.previousCrops
      ? 'Base this on the previous crops listed above.'
      : 'Suggest a rotation plan for the next two seasons.',
    '## What to Verify Locally',
    'List anything the farmer should confirm with their local extension officer or soil test.'
  );

  return lines.join('\n');
};

// @desc    Get an AI crop recommendation
// @route   POST /api/crop/recommend
// @access  Private
const getCropRecommendation = asyncHandler(async (req, res) => {
  const completion = await chatCompletion({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(req.body) },
    ],
    // Deterministic: two farmers with identical inputs should get the same advice.
    temperature: 0,
    maxTokens: 2000,
    feature: 'crop-recommendation',
  });

  const recommendation = firstMessage(completion).message?.content;

  if (!recommendation) {
    throw new AppError('The recommendation service returned an empty response', 502);
  }

  // `recommendation` at the top level is kept for backwards compatibility with
  // the existing client; `data` matches the envelope used everywhere else.
  res.status(200).json({ success: true, data: { recommendation }, recommendation });
});

module.exports = { getCropRecommendation };
