const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orders');
const { protect, authorize, BUYER_ROLES } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

router
  .route('/')
  .get(protect, validate(schemas.orderListQuery, 'query'), getOrders)
  // BUYER_ROLES rather than a bare 'buyer': ngo_buyer is a buyer variant that
  // was locked out of ordering entirely.
  .post(protect, authorize(...BUYER_ROLES), validate(schemas.createOrder), createOrder);

router
  .route('/:id')
  .get(protect, validate(schemas.idParam, 'params'), getOrder)
  .put(
    protect,
    authorize('farmer', 'admin'),
    validate(schemas.idParam, 'params'),
    validate(schemas.updateOrderStatus),
    updateOrderStatus
  );

router
  .route('/:id/cancel')
  .put(
    protect,
    authorize(...BUYER_ROLES, 'admin'),
    validate(schemas.idParam, 'params'),
    cancelOrder
  );

module.exports = router;
