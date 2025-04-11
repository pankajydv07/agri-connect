const express = require('express');
const { 
  getUsers, 
  deleteUser, 
  getStats 
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

module.exports = router;
