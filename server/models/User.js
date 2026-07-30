const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'ngo_buyer', 'admin'],
      default: 'buyer',
    },
    location: {
      type: String,
      required: [true, 'Please add your location'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add your phone number'],
      trim: true,
    },
    /**
     * Lets `protect` reject tokens minted before the most recent password
     * change. Without it, a password reset did nothing to revoke a stolen token.
     */
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// `email` already has a unique index. `role` is filtered on by the admin
// dashboard stats, which previously did a full collection scan per counter.
UserSchema.index({ role: 1 });

UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    // The original called next() here but did not return, so execution fell
    // through and re-hashed the already-hashed password on every save.
    return next();
  }

  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);

  // Backdate by a second: the JWT may be issued in the same second as the save,
  // and a token must never look older than the change it precedes.
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  return next();
});

UserSchema.methods.getSignedJwtToken = function getSignedJwtToken() {
  return jwt.sign({ id: this._id, role: this.role }, env.JWT_SECRET, {
    // env.JWT_EXPIRE always has a value; an undefined `expiresIn` used to mint
    // tokens that never expired.
    expiresIn: env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/** The shape safe to return to a client — never includes the password hash. */
UserSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    location: this.location,
    phone: this.phone,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
