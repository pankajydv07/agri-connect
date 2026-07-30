/**
 * Server-side AI proxy.
 *
 * The chatbot previously called GitHub Models inference directly from the
 * browser using a hardcoded GitHub personal access token, and bundled the whole
 * OpenAI SDK into the client. The model provider is now reached only from here,
 * so the credential never leaves the server and every call is attributable to
 * an authenticated user and rate limited.
 */

const OpenAI = require('openai');
const env = require('../config/env');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

let client;

const getClient = () => {
  if (!env.openai.configured) {
    throw new AppError('The AI assistant is not configured on this server', 503);
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openai.apiKey });
  }
  return client;
};

const LANGUAGE_NAMES = {
  'en-US': 'English',
  en: 'English',
  'hi-IN': 'Hindi',
  hi: 'Hindi',
  'te-IN': 'Telugu',
  te: 'Telugu',
};

/**
 * The assistant's role-awareness is decided here, from the JWT — not from
 * anything the browser claims. A buyer cannot ask the assistant to act with a
 * farmer's capabilities by editing a client-side system prompt.
 */
const buildSystemPrompt = (user, language) => {
  const languageName = LANGUAGE_NAMES[language] || 'English';

  const roleGuidance =
    user.role === 'farmer'
      ? 'This user is a FARMER. Help them list produce, manage their listings, review incoming ' +
        'orders, and answer practical growing questions.'
      : 'This user is a BUYER. Help them find produce, understand listings, place orders, and ' +
        'track order status. Do not offer to create or edit produce listings.';

  return [
    'You are the AgriConnect assistant, helping connect Indian farmers directly with buyers.',
    roleGuidance,
    `The user's name is ${user.name} and they are located in ${user.location}.`,
    `Reply in ${languageName}, in plain language suitable for someone with limited literacy.`,
    'Keep answers short and concrete. Prices are in Indian Rupees (₹).',
    'Never invent order numbers, prices, or availability — if you need data, call the ' +
      'appropriate tool. If a tool is unavailable, say so plainly rather than guessing.',
  ].join(' ');
};

// @desc    Proxy a chat completion for the signed-in user
// @route   POST /api/ai/chat
// @access  Private
exports.chat = asyncHandler(async (req, res) => {
  const { messages, tools, language } = req.body;

  const openai = getClient();

  // Strip any client-supplied system message and prepend our own, so the
  // browser cannot rewrite the assistant's instructions or role.
  const conversation = [
    { role: 'system', content: buildSystemPrompt(req.user, language) },
    ...messages.filter((message) => message.role !== 'system'),
  ];

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: env.openai.model,
      messages: conversation,
      ...(tools && tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
      temperature: 0.3,
      max_tokens: 800,
    });
  } catch (error) {
    logger.error({ err: error, status: error.status }, 'AI chat completion failed');

    if (error.status === 429) {
      throw new AppError('The assistant is busy right now — please try again shortly', 429);
    }
    if (error.status === 401 || error.status === 403) {
      throw new AppError('The assistant rejected our credentials', 502);
    }
    throw new AppError('The assistant is unavailable — please try again later', 502);
  }

  const choice = completion.choices?.[0];

  if (!choice) {
    throw new AppError('The assistant returned an empty response', 502);
  }

  res.status(200).json({
    success: true,
    data: {
      message: choice.message?.content || '',
      toolCalls: choice.message?.tool_calls || [],
      finishReason: choice.finish_reason,
    },
  });
});
