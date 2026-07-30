/**
 * Speech-to-text and text-to-speech.
 *
 * These endpoints used to live inline in `server.js`, entirely unauthenticated,
 * so anyone on the internet could burn the project's Google Cloud quota. They
 * now sit behind `protect` plus the AI rate limiter.
 */

const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { SpeechClient } = require('@google-cloud/speech');
const { clientOptions, assertConfigured } = require('../utils/googleCloud');
const { synthesizeSpeech } = require('../ttsService');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * Generated audio is disposable, so it goes to the OS temp directory rather
 * than a tracked `uploads/` folder inside the repo. Anything older than an hour
 * is swept on write.
 */
const AUDIO_DIR = path.join(os.tmpdir(), 'agri-connect-audio');
const AUDIO_TTL_MS = 60 * 60 * 1000;

let speechClient;

const getSpeechClient = () => {
  assertConfigured();
  if (!speechClient) {
    speechClient = new SpeechClient(clientOptions());
  }
  return speechClient;
};

const sweepOldAudio = async () => {
  try {
    const entries = await fs.readdir(AUDIO_DIR);
    const cutoff = Date.now() - AUDIO_TTL_MS;

    await Promise.all(
      entries.map(async (entry) => {
        const filePath = path.join(AUDIO_DIR, entry);
        const stat = await fs.stat(filePath).catch(() => null);
        if (stat && stat.mtimeMs < cutoff) {
          await fs.unlink(filePath).catch(() => {});
        }
      })
    );
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn({ err: error }, 'Failed to sweep generated audio');
    }
  }
};

// @desc    Transcribe an uploaded audio clip
// @route   POST /api/speech/transcribe
// @access  Private
exports.transcribe = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No audio file provided', 400);
  }

  const language = ['en-US', 'hi-IN', 'te-IN'].includes(req.body.language)
    ? req.body.language
    : 'en-US';

  // Multer holds the upload in memory, so there is no temp file to clean up —
  // the old flow wrote every clip to disk and only sometimes deleted it.
  const [response] = await getSpeechClient().recognize({
    audio: { content: req.file.buffer.toString('base64') },
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: language,
      model: 'default',
      audioChannelCount: 1,
      enableAutomaticPunctuation: true,
      useEnhanced: true,
    },
  });

  const transcript = (response.results || [])
    .map((result) => result.alternatives?.[0]?.transcript || '')
    .filter(Boolean)
    .join('\n');

  res.status(200).json({ success: true, transcript });
});

// @desc    Synthesise speech from text
// @route   POST /api/speak
// @access  Private
exports.speak = asyncHandler(async (req, res) => {
  const { message, language } = req.body;

  const audio = await synthesizeSpeech(message, language);

  await fs.mkdir(AUDIO_DIR, { recursive: true });

  // A unique name per request. The original always wrote the same
  // `farmer-output.mp3`, so concurrent users overwrote each other's audio.
  const filename = `${crypto.randomUUID()}.mp3`;
  await fs.writeFile(path.join(AUDIO_DIR, filename), audio);

  // Fire-and-forget cleanup; never block the response on it.
  sweepOldAudio();

  res.status(200).json({
    success: true,
    status: 'Audio created!',
    // A path, not a hardcoded http://localhost:5000 URL — the client resolves
    // it against its configured API origin.
    file: `/media/audio/${filename}`,
  });
});

exports.AUDIO_DIR = AUDIO_DIR;
