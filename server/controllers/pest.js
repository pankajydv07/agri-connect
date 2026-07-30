/**
 * Pest and disease detection from a crop photo.
 *
 * What this replaces: the client page previously waited two seconds behind a
 * fake timer and returned a hardcoded "Colorado Potato Beetle" diagnosis for
 * every image, while the README advertised real AI detection.
 *
 * IMPORTANT — the honest framing, which the prompt and the response shape both
 * enforce: the model behind this (`qwen/qwen3.6-27b`) is a general-purpose
 * vision model, not a trained plant-pathology classifier. Connecting a real
 * model removes the *fabrication* problem but not the *accuracy* problem. A
 * confidently wrong diagnosis can still cost a farmer a crop, so this endpoint:
 *
 *   - forces the model to report per-finding confidence and alternatives,
 *   - refuses to answer on images that are not plants or are too poor to read,
 *   - always returns `needsExpertReview`, escalated to true whenever confidence
 *     is low or severity is high,
 *   - never returns treatment advice without the accompanying caveat.
 */

const { chatCompletion, firstMessage } = require('../utils/groq');
const env = require('../config/env');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const EXPERT_REFERRAL =
  'This is an AI-assisted assessment, not a substitute for expert diagnosis. ' +
  'Confirm with your local agricultural extension officer or Krishi Vigyan Kendra ' +
  'before applying any treatment, especially chemical pesticides.';

const SYSTEM_PROMPT = `You are an agricultural plant-health assistant analysing a photograph of a crop for an Indian farmer.

You are NOT a certified plant pathologist and you must never present yourself as one. Your job is to give a careful, calibrated, honest reading of what is visible in the image.

Rules you must follow:
1. Only describe what is actually visible. Never invent a pest or disease to give a confident-sounding answer.
2. If the image is not a plant, or is too blurry, dark or distant to assess, say so and return no findings.
3. For every finding, give an honest confidence level. Use "low" freely — a low-confidence honest answer is far more useful than a high-confidence guess.
4. Always list plausible alternatives in "differentials". Many crop problems look alike, and nutrient deficiency, water stress and disease are routinely confused.
5. Prefer organic and cultural controls first. Only mention chemical treatment as a later option, and never name a specific concentration or dosage — that must come from a local expert.
6. Never recommend a pesticide as a certainty. Frame treatments as options to discuss with an extension officer.

Respond with ONLY a JSON object in exactly this shape:
{
  "isPlantImage": boolean,
  "imageQuality": "good" | "fair" | "poor" | "unusable",
  "cropIdentified": string | null,
  "overallHealth": "healthy" | "minor_issues" | "significant_issues" | "severe" | "unknown",
  "summary": string,
  "findings": [
    {
      "name": string,
      "type": "pest" | "disease" | "nutrient_deficiency" | "water_stress" | "other",
      "confidence": "high" | "medium" | "low",
      "confidencePercent": number,
      "severity": "low" | "moderate" | "high",
      "evidence": string
    }
  ],
  "differentials": [string],
  "immediateActions": [string],
  "organicTreatment": [string],
  "chemicalTreatment": [string],
  "preventiveMeasures": [string],
  "limitations": string
}`;

const ALLOWED_CONFIDENCE = ['high', 'medium', 'low'];
const ALLOWED_SEVERITY = ['low', 'moderate', 'high'];
const ALLOWED_TYPES = ['pest', 'disease', 'nutrient_deficiency', 'water_stress', 'other'];
const ALLOWED_QUALITY = ['good', 'fair', 'poor', 'unusable'];
const ALLOWED_HEALTH = ['healthy', 'minor_issues', 'significant_issues', 'severe', 'unknown'];

const asStringArray = (value, limit = 10) =>
  Array.isArray(value)
    ? value.filter((entry) => typeof entry === 'string' && entry.trim()).slice(0, limit)
    : [];

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const clampPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
};

/**
 * Normalises the model's JSON.
 *
 * An LLM will occasionally return a near-miss: a string where an array was
 * asked for, an enum value slightly off, a percentage over 100. Everything the
 * client renders is coerced into a known shape here so a malformed response
 * degrades gracefully instead of breaking the page.
 */
const normalise = (raw) => {
  const findings = Array.isArray(raw.findings) ? raw.findings : [];

  const cleanFindings = findings
    .filter((f) => f && typeof f.name === 'string' && f.name.trim())
    .slice(0, 6)
    .map((f) => ({
      name: f.name.trim().slice(0, 200),
      type: oneOf(f.type, ALLOWED_TYPES, 'other'),
      confidence: oneOf(f.confidence, ALLOWED_CONFIDENCE, 'low'),
      confidencePercent: clampPercent(f.confidencePercent),
      severity: oneOf(f.severity, ALLOWED_SEVERITY, 'moderate'),
      evidence: typeof f.evidence === 'string' ? f.evidence.slice(0, 600) : '',
    }));

  const hasLowConfidence = cleanFindings.some((f) => f.confidence !== 'high');
  const hasHighSeverity = cleanFindings.some((f) => f.severity === 'high');
  const quality = oneOf(raw.imageQuality, ALLOWED_QUALITY, 'fair');

  return {
    isPlantImage: raw.isPlantImage !== false,
    imageQuality: quality,
    cropIdentified:
      typeof raw.cropIdentified === 'string' && raw.cropIdentified.trim()
        ? raw.cropIdentified.trim().slice(0, 120)
        : null,
    overallHealth: oneOf(raw.overallHealth, ALLOWED_HEALTH, 'unknown'),
    summary: typeof raw.summary === 'string' ? raw.summary.slice(0, 1200) : '',
    findings: cleanFindings,
    differentials: asStringArray(raw.differentials, 8),
    immediateActions: asStringArray(raw.immediateActions, 8),
    organicTreatment: asStringArray(raw.organicTreatment, 8),
    chemicalTreatment: asStringArray(raw.chemicalTreatment, 8),
    preventiveMeasures: asStringArray(raw.preventiveMeasures, 8),
    limitations: typeof raw.limitations === 'string' ? raw.limitations.slice(0, 800) : '',
    /**
     * Server-enforced, never taken from the model. Anything less than a
     * unanimously high-confidence, low-severity reading gets escalated — and an
     * empty finding list still warrants a second opinion.
     */
    needsExpertReview:
      cleanFindings.length === 0 || hasLowConfidence || hasHighSeverity || quality !== 'good',
    disclaimer: EXPERT_REFERRAL,
    model: env.groq.visionModel,
  };
};

// @desc    Analyse a crop photo for pests and disease
// @route   POST /api/pest-detection
// @access  Private
exports.analyse = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please attach an image of the affected plant', 400);
  }

  const { cropHint, language } = req.body;

  // The vision API takes a data URL; the upload is held in memory, so nothing
  // is written to disk.
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const userText = [
    'Analyse this crop photograph for pests, disease, or nutrient problems.',
    cropHint ? `The farmer says the crop is: ${cropHint}.` : null,
    language && language !== 'en'
      ? `Write the "summary", "immediateActions", "organicTreatment", "chemicalTreatment", "preventiveMeasures" and "limitations" values in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}. Keep all JSON keys and enum values in English.`
      : null,
  ]
    .filter(Boolean)
    .join(' ');

  const completion = await chatCompletion({
    model: env.groq.visionModel,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    jsonMode: true,
    // Low temperature: this is a diagnostic task, not a creative one.
    temperature: 0.1,
    maxTokens: 2000,
    feature: 'pest-detection',
  });

  const content = firstMessage(completion).message?.content;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    logger.error({ content: String(content).slice(0, 500) }, 'Pest detection returned invalid JSON');
    throw new AppError('Could not interpret the analysis result — please try again', 502);
  }

  const result = normalise(parsed);

  // Refuse rather than guess. Returning a plant diagnosis for a photo of a wall
  // is exactly the failure mode this endpoint exists to eliminate.
  if (!result.isPlantImage) {
    return res.status(422).json({
      success: false,
      message:
        "That image doesn't appear to show a plant. Please upload a clear, close-up photo of the affected leaves or stem.",
      data: { isPlantImage: false, imageQuality: result.imageQuality },
    });
  }

  if (result.imageQuality === 'unusable') {
    return res.status(422).json({
      success: false,
      message:
        'That image is too blurry or dark to assess. Try again in daylight, holding the camera close to the affected area.',
      data: { isPlantImage: true, imageQuality: 'unusable' },
    });
  }

  logger.info(
    {
      userId: req.user.id,
      crop: result.cropIdentified,
      findings: result.findings.length,
      health: result.overallHealth,
    },
    'Pest detection completed'
  );

  res.status(200).json({ success: true, data: result });
});

exports._internal = { normalise, EXPERT_REFERRAL };
