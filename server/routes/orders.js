const express = require('express');
const { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrderStatus, 
  cancelOrder 
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('buyer'), createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('farmer', 'admin'), updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, authorize('buyer'), cancelOrder);

module.exports = router;
