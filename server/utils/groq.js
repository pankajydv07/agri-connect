/**
 * Groq client — the single entry point for every LLM call in the application.
 *
 * Replaces two previous paths: a hardcoded Nebius bearer token pasted inline in
 * `controllers/cropController.js`, and a separate OpenAI client in
 * `controllers/ai.js`. One credential, one client, one place to change models.
 *
 * Groq's API is OpenAI-compatible, so the `openai` SDK already in
 * package.json talks to it with only a baseURL override — no new dependency.
 */

const OpenAI = require('openai');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

let client;

const getClient = () => {
  if (!env.groq.configured) {
    throw new AppError('AI features are not configured on this server', 503);
  }

  if (!client) {
    client = new OpenAI({
      apiKey: env.groq.apiKey,
      baseURL: env.groq.baseUrl,
      // Retry transient failures, but bound the wait so a slow model can't hold
      // a request thread indefinitely.
      maxRetries: 2,
      timeout: 45000,
    });
  }

  return client;
};

/**
 * Translates a provider failure into an error with a status the client can act
 * on, and a message safe to show a farmer. The provider's own response is
 * logged for us but never forwarded — it can contain account details.
 */
const toAppError = (error, feature) => {
  const status = error?.status || error?.response?.status;

  logger.error(
    { err: error, status, feature, model: error?.model },
    `Groq request failed (${feature})`
  );

  if (error?.name === 'APIConnectionTimeoutError' || error?.code === 'ETIMEDOUT') {
    return new AppError('The AI service timed out — please try again', 504);
  }
  if (status === 401 || status === 403) {
    return new AppError('The AI service rejected our credentials', 502);
  }
  if (status === 429) {
    return new AppError('The AI service is busy right now — please try again shortly', 429);
  }
  if (status === 413) {
    return new AppError('That input is too large for the AI service', 413);
  }
  // 400 from the provider means we built a bad request — a bug on our side, not
  // the caller's, so it must not surface as a 4xx blaming the client.
  if (status === 400) {
    return new AppError('The AI service could not process that request', 502);
  }

  return new AppError('The AI service is unavailable — please try again later', 502);
};

/**
 * Thin wrapper over chat completions.
 *
 * @param {object}  options
 * @param {string} [options.model]          Defaults to the configured chat model.
 * @param {Array}   options.messages
 * @param {Array}  [options.tools]          OpenAI-shaped tool definitions.
 * @param {boolean}[options.jsonMode]       Force a JSON object response.
 * @param {number} [options.temperature]
 * @param {number} [options.maxTokens]
 * @param {string} [options.feature]        Label used in logs.
 */
const chatCompletion = async ({
  model,
  messages,
  tools,
  jsonMode = false,
  temperature = 0.3,
  maxTokens = 1024,
  feature = 'chat',
}) => {
  const openai = getClient();

  try {
    return await openai.chat.completions.create({
      model: model || env.groq.chatModel,
      messages,
      ...(tools && tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature,
      max_tokens: maxTokens,
    });
  } catch (error) {
    throw toAppError(error, feature);
  }
};

/** Pulls the assistant text out of a completion, or throws if it's empty. */
const firstMessage = (completion) => {
  const choice = completion?.choices?.[0];
  if (!choice) {
    throw new AppError('The AI service returned an empty response', 502);
  }
  return choice;
};

const isConfigured = () => env.groq.configured;

module.exports = { chatCompletion, firstMessage, toAppError, isConfigured, getClient };
