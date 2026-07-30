/**
 * Server-side AI proxy.
 *
 * The chatbot previously called GitHub Models inference directly from the
 * browser using a hardcoded GitHub personal access token, and bundled the whole
 * OpenAI SDK into the client. The model provider is now reached only from here,
 * so the credential never leaves the server and every call is attributable to
 * an authenticated user and rate limited.
 *
 * Provider is Groq, shared with crop recommendation and pest detection through
 * `utils/groq.js`.
 */

const { chatCompletion, firstMessage } = require('../utils/groq');
const { asyncHandler } = require('../middleware/errorHandler');

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
        'orders, check the weather for their fields, and answer practical growing questions. ' +
        'They cannot place orders.'
      : 'This user is a BUYER. Help them search produce, understand listings, place orders, and ' +
        'track order status. Do not offer to create or edit produce listings — they cannot.';

  return [
    'You are the AgriConnect assistant, helping connect Indian farmers directly with buyers.',
    roleGuidance,
    `The user's name is ${user.name} and they are located in ${user.location}.`,
    `Reply in ${languageName}, in plain language suitable for someone with limited literacy.`,
    'Keep answers short and concrete. Prices are in Indian Rupees (₹).',
    // The anti-hallucination clause matters most for the tool-backed answers:
    // an invented order number or forecast is worse than an admission of doubt.
    'Never invent order numbers, prices, availability, or weather figures. If you need data, call ' +
      'the appropriate tool and use only what it returns. If a tool is unavailable or returns an ' +
      'error, say so plainly rather than guessing.',
    'When a tool needs a value you do not have — a product id, a delivery address, a location — ' +
      'ask the user for it instead of inventing one.',
  ].join(' ');
};

// @desc    Proxy a chat completion for the signed-in user
// @route   POST /api/ai/chat
// @access  Private
exports.chat = asyncHandler(async (req, res) => {
  const { messages, tools, language } = req.body;

  // Strip any client-supplied system message and prepend our own, so the
  // browser cannot rewrite the assistant's instructions or role.
  const conversation = [
    { role: 'system', content: buildSystemPrompt(req.user, language) },
    ...messages.filter((message) => message.role !== 'system'),
  ];

  const completion = await chatCompletion({
    messages: conversation,
    tools,
    temperature: 0.3,
    maxTokens: 800,
    feature: 'assistant-chat',
  });

  const choice = firstMessage(completion);

  res.status(200).json({
    success: true,
    data: {
      message: choice.message?.content || '',
      toolCalls: choice.message?.tool_calls || [],
      finishReason: choice.finish_reason,
    },
  });
});
