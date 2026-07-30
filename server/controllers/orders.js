const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { BUYER_ROLES } = require('../middleware/auth');
const logger = require('../config/logger');

const POPULATE = [
  { path: 'product', select: 'cropName price unit image description' },
  { path: 'buyer', select: 'name location phone' },
  { path: 'farmer', select: 'name location phone' },
];

/** Legal status moves. Cancelled and Delivered are terminal. */
const ALLOWED_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

// @desc    Get orders for the current user
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const filter = {};

  if (req.user.role === 'farmer') {
    filter.farmer = req.user.id;
  } else if (BUYER_ROLES.includes(req.user.role)) {
    // `ngo_buyer` used to match no branch at all, leaving `query` undefined and
    // throwing a TypeError on the next line for every NGO user.
    filter.buyer = req.user.id;
  } else if (req.user.role !== 'admin') {
    throw new AppError('Not authorized to list orders', 403);
  }

  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  // This endpoint had no pagination at all and returned every order ever placed.
  const [orders, total] = await Promise.all([
    Order.find(filter).populate(POPULATE).sort('-createdAt').skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: skip + orders.length < total,
      hasPrev: page > 1,
    },
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Participants or admin)
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(POPULATE);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Compare against the raw refs, not populated docs: if a referenced user was
  // deleted, populate yields null and the old code threw on `._id`.
  const buyerId = order.buyer?._id?.toString();
  const farmerId = order.farmer?._id?.toString();

  if (buyerId !== req.user.id && farmerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this order', 403);
  }

  res.status(200).json({ success: true, data: order });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyers only)
exports.createOrder = asyncHandler(async (req, res) => {
  const { productId, quantityOrdered, deliveryAddress } = req.body;

  /**
   * Stock is decremented with a single conditional update.
   *
   * The original read `product.quantity`, compared it, created the order, then
   * saved a decremented quantity — three separate round trips with no
   * transaction. Two concurrent buyers could both pass the check and both
   * decrement, driving inventory negative and overselling a farmer's crop.
   *
   * `findOneAndUpdate` with `quantity: { $gte: n }` in the filter makes the
   * check-and-decrement one atomic operation: whoever loses the race simply
   * doesn't match, and no transaction (or replica set) is required.
   */
  const product = await Product.findOneAndUpdate(
    { _id: productId, quantity: { $gte: quantityOrdered }, status: 'Available' },
    { $inc: { quantity: -quantityOrdered } },
    { new: true }
  );

  if (!product) {
    // Distinguish "gone" from "not enough left" for a useful error message.
    const existing = await Product.findById(productId).lean();

    if (!existing) {
      throw new AppError('Product not found', 404);
    }
    if (existing.status !== 'Available') {
      throw new AppError(`This listing is currently marked "${existing.status}"`, 409);
    }
    throw new AppError(
      `Not enough quantity available. Available: ${existing.quantity} ${existing.unit}`,
      409
    );
  }

  if (product.farmer.toString() === req.user.id) {
    // Restore the stock we just claimed before rejecting.
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantityOrdered } });
    throw new AppError('You cannot order your own listing', 400);
  }

  try {
    const order = await Order.create({
      product: product._id,
      buyer: req.user.id,
      farmer: product.farmer,
      quantityOrdered,
      unitPriceAtOrder: product.price,
      totalPrice: product.price * quantityOrdered,
      deliveryAddress,
    });

    // Sold out: reflect it so the listing stops accepting orders.
    if (product.quantity === 0) {
      await Product.findByIdAndUpdate(product._id, { status: 'Out of Stock' });
    }

    const populated = await Order.findById(order._id).populate(POPULATE);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    // Compensating write: the stock decrement already committed, so if order
    // creation fails we must give it back or the quantity is lost forever.
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantityOrdered } });
    logger.error({ err: error, productId }, 'Order creation failed — stock restored');
    throw error;
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Order's farmer or admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this order', 403);
  }

  if (order.status === status) {
    throw new AppError(`Order is already ${status}`, 409);
  }

  // Previously any status could be set from any other, so a Delivered order
  // could be moved back to Pending.
  if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
    throw new AppError(`Cannot change status from ${order.status} to ${status}`, 409);
  }

  // Cancelling from the farmer's side must also return the stock.
  if (status === 'Cancelled') {
    await Product.findByIdAndUpdate(order.product, {
      $inc: { quantity: order.quantityOrdered },
    });
  }

  order.status = status;
  await order.save();

  const populated = await Order.findById(order._id).populate(POPULATE);

  res.status(200).json({ success: true, data: populated });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Order's buyer or admin)
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  if (order.status !== 'Pending') {
    throw new AppError(`Cannot cancel an order that is already ${order.status}`, 409);
  }

  order.status = 'Cancelled';
  await order.save();

  /**
   * Restore stock atomically. The original did
   * `const product = await Product.findById(...); product.quantity += ...`
   * which threw a TypeError if the product had since been deleted, leaving the
   * order cancelled but the response a 500.
   */
  const restored = await Product.findByIdAndUpdate(
    order.product,
    { $inc: { quantity: order.quantityOrdered } },
    { new: true }
  );

  if (!restored) {
    logger.warn(
      { orderId: order._id, productId: order.product },
      'Cancelled order references a deleted product — no stock restored'
    );
  } else if (restored.status === 'Out of Stock' && restored.quantity > 0) {
    // Bring a sold-out listing back now that stock has returned.
    restored.status = 'Available';
    await restored.save();
  }

  const populated = await Order.findById(order._id).populate(POPULATE);

  res.status(200).json({ success: true, data: populated });
});
