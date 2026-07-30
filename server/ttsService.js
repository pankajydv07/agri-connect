/**
 * Text-to-speech synthesis.
 *
 * Two changes from the original beyond credential handling:
 *  - It no longer writes to disk. Every call used to overwrite the same
 *    `uploads/farmer-output.mp3`, so two users speaking at once got each
 *    other's audio. Returning a buffer lets the caller decide.
 *  - The chatty `console.log` of every phrase synthesised is gone.
 */

const textToSpeech = require('@google-cloud/text-to-speech');
const { clientOptions, assertConfigured } = require('./utils/googleCloud');
const logger = require('./config/logger');

const VOICE_CONFIGS = {
  'en-US': { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
  'hi-IN': { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE' },
  'te-IN': { languageCode: 'te-IN', name: 'te-IN-Standard-A', ssmlGender: 'FEMALE' },
};

let client;

/** Built lazily so an unconfigured server still boots and serves everything else. */
const getClient = () => {
  assertConfigured();
  if (!client) {
    client = new textToSpeech.TextToSpeechClient(clientOptions());
  }
  return client;
};

/**
 * @param {string} text
 * @param {string} language One of the keys of VOICE_CONFIGS.
 * @returns {Promise<Buffer>} MP3 audio.
 */
const synthesizeSpeech = async (text, language = 'en-US') => {
  const voice = VOICE_CONFIGS[language] || VOICE_CONFIGS['en-US'];

  const [response] = await getClient().synthesizeSpeech({
    input: { text },
    voice,
    audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 1.0 },
  });

  if (!response.audioContent) {
    throw new Error('Text-to-speech returned no audio content');
  }

  logger.debug({ language, characters: text.length }, 'Synthesised speech');

  return Buffer.from(response.audioContent);
};

module.exports = { synthesizeSpeech, VOICE_CONFIGS };
