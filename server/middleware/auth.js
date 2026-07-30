const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { AppError, asyncHandler } = require('./errorHandler');

/**
 * Verifies the bearer token and loads the current user.
 *
 * Three bugs are fixed here versus the original:
 *  1. A deleted user's token still passed, leaving `req.user = null`, and
 *     `authorize` then threw a TypeError on `req.user.role` instead of 401.
 *  2. Changing your password did not invalidate tokens issued beforehand, so a
 *     stolen token outlived the password reset meant to revoke it.
 *  3. Errors were swallowed into a generic 401, hiding expiry from the client.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  // Throws JsonWebTokenError / TokenExpiredError, mapped to 401 by the handler.
  const decoded = jwt.verify(token, env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    throw new AppError('The account for this session no longer exists', 401);
  }

  // `iat` is in seconds; a token minted before the last password change is dead.
  if (user.passwordChangedAt) {
    const changedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat && decoded.iat < changedAtSeconds) {
      throw new AppError('Password was changed — please sign in again', 401);
    }
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Safe to call only after `protect`;
 * the guard below makes a misordered mount a 401 rather than a 500.
 */
exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`The ${req.user.role} role cannot access this route`, 403)
      );
    }

    return next();
  };

/** Treats both buyer variants as buyers, so `ngo_buyer` stops falling through. */
exports.BUYER_ROLES = ['buyer', 'ngo_buyer'];
