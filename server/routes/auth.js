const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// authLimiter: these were previously unthrottled, so password guessing was
// bounded only by the attacker's bandwidth.
router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);

router.get('/me', protect, getMe);
router.put('/profile', protect, validate(schemas.updateProfile), updateProfile);
router.put(
  '/change-password',
  protect,
  authLimiter,
  validate(schemas.changePassword),
  changePassword
);

module.exports = router;
