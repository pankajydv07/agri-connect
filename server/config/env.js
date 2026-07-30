/**
 * Boot-time environment validation.
 *
 * The server used to read `process.env.*` ad hoc at the point of use, which
 * meant a missing variable surfaced as a confusing runtime error (or, worse,
 * silently changed behaviour — an absent JWT_EXPIRE made `jwt.sign` mint
 * non-expiring tokens). This module validates everything once, at startup,
 * and fails fast with an actionable message.
 *
 * Import this before anything else that touches configuration.
 */

require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const errors = [];
const warnings = [];

// ---------------------------------------------------------------------------
// Hard requirements — the process cannot serve traffic without these.
// ---------------------------------------------------------------------------
const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  // Tests inject their own MONGODB_URI (mongodb-memory-server) after import.
  if (isTest && key === 'MONGODB_URI') continue;
  if (!process.env[key]) {
    errors.push(`${key} is required but was not set.`);
  }
}

// A short signing secret is the difference between "has auth" and "has the
// appearance of auth", so refuse to boot with a weak one in production.
if (process.env.JWT_SECRET && isProduction && process.env.JWT_SECRET.length < 32) {
  errors.push('JWT_SECRET must be at least 32 characters in production.');
}

if (isProduction && !process.env.CORS_ORIGINS) {
  errors.push(
    'CORS_ORIGINS is required in production (comma-separated list of allowed browser origins).'
  );
}

// ---------------------------------------------------------------------------
// Optional integrations. Missing keys disable the feature rather than crash
// the server, but we say so loudly at boot so it is never a silent surprise.
// ---------------------------------------------------------------------------
const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// Groq now serves every LLM call — the assistant, crop recommendation and pest
// detection. It replaces the previous split between Nebius (whose bearer token
// was hardcoded in a controller) and OpenAI.
const groqConfigured = Boolean(process.env.GROQ_API_KEY);

const googleCloudConfigured = Boolean(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON
);

if (!isTest) {
  if (!cloudinaryConfigured) {
    warnings.push('Cloudinary is not configured — product image upload will be rejected.');
  }
  if (!groqConfigured) {
    warnings.push(
      'GROQ_API_KEY is not set — the AI assistant, crop recommendation and pest detection will be unavailable.'
    );
  }
  if (!googleCloudConfigured) {
    warnings.push(
      'No Google Cloud credentials — speech-to-text and text-to-speech will be unavailable. ' +
        'Set GOOGLE_APPLICATION_CREDENTIALS to a key file path, or GOOGLE_CREDENTIALS_JSON to the key JSON itself.'
    );
  }
}

if (errors.length > 0) {
  const message = [
    'Invalid environment configuration:',
    ...errors.map((error) => `  - ${error}`),
    '',
    'See .env.example for the full list of supported variables.',
  ].join('\n');

  throw new Error(message);
}

const env = {
  NODE_ENV,
  isProduction,
  isTest,
  isDevelopment: NODE_ENV === 'development',

  PORT: toInt(process.env.PORT, 5000),
  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  // Explicit default: an undefined `expiresIn` mints tokens that never expire.
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  BCRYPT_ROUNDS: toInt(process.env.BCRYPT_ROUNDS, 12),

  // Default to the CRA dev server so local development needs no extra config.
  CORS_ORIGINS: toList(process.env.CORS_ORIGINS).length
    ? toList(process.env.CORS_ORIGINS)
    : ['http://localhost:3000'],

  // Public origin of this API, used to build absolute URLs for generated files
  // instead of the hardcoded `http://localhost:5000` that used to ship.
  PUBLIC_URL: (process.env.PUBLIC_URL || '').replace(/\/$/, ''),

  RATE_LIMIT_WINDOW_MINUTES: toInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 15),
  RATE_LIMIT_MAX: toInt(process.env.RATE_LIMIT_MAX, 300),
  AUTH_RATE_LIMIT_MAX: toInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
  AI_RATE_LIMIT_MAX: toInt(process.env.AI_RATE_LIMIT_MAX, 30),

  MAX_UPLOAD_BYTES: toInt(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
  MAX_AUDIO_UPLOAD_BYTES: toInt(process.env.MAX_AUDIO_UPLOAD_BYTES, 10 * 1024 * 1024),

  LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  cloudinary: {
    configured: cloudinaryConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  /**
   * Groq. The API is OpenAI-compatible, so the `openai` SDK talks to it with
   * nothing but a baseURL override — no extra dependency.
   *
   * Every model id is overridable from the environment on purpose. Groq rotates
   * and deprecates models on short notice (their docs warn about exactly this
   * for preview models), so a hardcoded id is a scheduled outage.
   */
  groq: {
    configured: groqConfigured,
    apiKey: process.env.GROQ_API_KEY,
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    // Tool-calling chat model for the assistant and crop recommendation.
    chatModel: process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile',
    // Multimodal model for pest detection — supports image input and JSON mode.
    visionModel: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b',
  },

  googleCloud: {
    configured: googleCloudConfigured,
    // A file path (preferred for local dev) …
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    // … or the raw JSON, which is how most PaaS providers inject secrets.
    credentialsJson: process.env.GOOGLE_CREDENTIALS_JSON,
  },

  warnings,
};

module.exports = env;
