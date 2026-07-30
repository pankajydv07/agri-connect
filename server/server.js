/**
 * Process entry point: validate config, connect to MongoDB, listen, and shut
 * down cleanly.
 *
 * The original called `mongoose.connect(...)` and `app.listen(...)` immediately,
 * logged any connection failure, and then happily served traffic against a
 * database it was not connected to. It also had no SIGTERM handling, so every
 * container redeploy killed in-flight requests.
 */

// Importing config first means a misconfigured server fails at boot with a clear
// message rather than at the first request that needs the missing value.
const env = require('./config/env');
const logger = require('./config/logger');
const mongoose = require('mongoose');
const app = require('./app');

// Surface configuration gaps (missing optional integrations) once, at startup.
env.warnings.forEach((warning) => logger.warn(warning));

let server;

const start = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('MongoDB connected');
  } catch (error) {
    // Refuse to serve traffic without a database.
    logger.fatal({ err: error }, 'Failed to connect to MongoDB — exiting');
    process.exit(1);
  }

  server = app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

/** Drains connections, closes the DB, then exits. */
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);

  // Force exit if a hung connection prevents a clean close.
  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close(false);
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
};

['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

// A crash should be loud and fatal, not a silently degraded process.
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection — shutting down');
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception — shutting down');
  shutdown('uncaughtException');
});

start();

module.exports = { app, start, shutdown };
