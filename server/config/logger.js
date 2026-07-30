/**
 * Structured logging.
 *
 * Replaces scattered `console.log` calls — several of which were printing user
 * IDs and full order documents to stdout. Pino emits levelled JSON in
 * production (ready for any log aggregator) and human-readable lines locally.
 */

const pino = require('pino');
const env = require('./env');

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.newPassword',
  'req.body.currentPassword',
  'password',
  'token',
  '*.password',
  '*.token',
];

const logger = pino({
  level: env.isTest ? 'silent' : env.LOG_LEVEL,
  redact: { paths: redactPaths, censor: '[redacted]' },
  // Pretty output locally; raw JSON in production so logs stay machine-parseable.
  transport: env.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
});

module.exports = logger;
