/**
 * Rate limiting.
 *
 * `POST /api/auth/login` previously had no limiter at all, so credential
 * stuffing was bounded only by the attacker's bandwidth. The AI endpoints are
 * limited separately because each call costs real money at a third-party
 * provider.
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const minutes = (n) => n * 60 * 1000;

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  // Skip limiting in tests so suites don't fail on the 11th request.
  skip: () => env.isTest,
  message: { success: false, message: 'Too many requests — please try again later' },
};

/** Broad limiter applied to the whole API surface. */
const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(env.RATE_LIMIT_WINDOW_MINUTES),
  max: env.RATE_LIMIT_MAX,
});

/**
 * Tight limiter for credential endpoints. Counts by email as well as IP so a
 * botnet rotating IPs against one account still gets throttled.
 */
const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(env.RATE_LIMIT_WINDOW_MINUTES),
  max: env.AUTH_RATE_LIMIT_MAX,
  keyGenerator: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase()}`,
  message: {
    success: false,
    message: 'Too many sign-in attempts — please wait a few minutes and try again',
  },
});

/** Limiter for the paid AI/speech endpoints, keyed per authenticated user. */
const aiLimiter = rateLimit({
  ...baseOptions,
  windowMs: minutes(env.RATE_LIMIT_WINDOW_MINUTES),
  max: env.AI_RATE_LIMIT_MAX,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'AI request limit reached — please try again shortly',
  },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
