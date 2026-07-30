/**
 * Centralised error handling.
 *
 * Every controller previously ended in `catch (error) { res.status(400)... }`,
 * so a dropped database connection and a bad email both returned 400 and
 * clients could not tell "you sent something wrong" from "we broke". These
 * helpers map failures onto correct status codes in one place.
 */

const logger = require('../config/logger');
const env = require('../config/env');

/** An error we raised deliberately, with a status the client can act on. */
class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * pipeline instead of hanging the request as an unhandled rejection.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** 404 for unmatched routes — must be mounted after all real routes. */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/* eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity. */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  // Malformed ObjectId — the client asked for a resource id that cannot exist.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose schema validation.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Unique index violation (e.g. duplicate email).
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already registered`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired — please sign in again';
  }

  // Multer surfaces upload problems as coded errors.
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'Uploaded file is too large';
  }

  // 5xx means we broke: log the stack. 4xx is the client's problem: log quietly.
  const logPayload = {
    err,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id,
  };

  if (statusCode >= 500) {
    logger.error(logPayload, 'Unhandled server error');
  } else {
    logger.warn(logPayload, 'Request failed');
  }

  // Never leak internals to the client in production.
  if (statusCode >= 500 && env.isProduction) {
    message = 'Something went wrong';
    details = undefined;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = { AppError, asyncHandler, notFound, errorHandler };
