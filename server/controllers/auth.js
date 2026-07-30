const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/** Builds the auth response. Never returns the password hash. */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  // `req.body` has already been parsed by the `register` zod schema, which
  // allows only farmer / buyer / ngo_buyer. Previously `role` came straight
  // from the request body, so anyone could POST {"role":"admin"} and self-grant
  // full administrative access.
  const { name, email, password, role, location, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with that email already exists', 409);
  }

  const user = await User.create({ name, email, password, role, location, phone });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  // Same message and status for "no such user" and "wrong password" so the
  // endpoint cannot be used to enumerate which emails are registered.
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, location, phone } = req.body;

  if (email) {
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) {
      throw new AppError('That email is already in use', 409);
    }
  }

  // Only these four fields can ever be written here — `role` is deliberately
  // absent so profile editing cannot be used to escalate privileges.
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (location !== undefined) updates.location = location;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({ success: true, data: user.toPublicJSON() });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!(await user.matchPassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from the current one', 400);
  }

  user.password = newPassword;
  // The pre-save hook stamps passwordChangedAt, which invalidates every token
  // issued before now.
  await user.save();

  // Issue a fresh token so the caller isn't logged out by their own change.
  sendTokenResponse(user, 200, res);
});
