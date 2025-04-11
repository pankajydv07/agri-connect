const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query;

    // If user is a farmer, get only their orders
    if (req.user.role === 'farmer') {
      query = Order.find({ farmer: req.user.id });
    } 
    // If user is a buyer, get only their orders
    else if (req.user.role === 'buyer') {
      query = Order.find({ buyer: req.user.id });
    } 
    // If user is admin, get all orders
    else if (req.user.role === 'admin') {
      query = Order.find({});
    }

    query = query.populate({
      path: 'product',
      select: 'cropName price unit'
    }).populate({
      path: 'buyer',
      select: 'name location phone'
    }).populate({
      path: 'farmer',
      select: 'name location phone'
    });

    const orders = await query;

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    console.log('Fetching order:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);

    const order = await Order.findById(req.params.id)
      .populate({
        path: 'product',
        select: 'cropName price unit image description'
      })
      .populate({
        path: 'buyer',
        select: 'name location phone'
      })
      .populate({
        path: 'farmer',
        select: 'name location phone'
      });

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    console.log('Order found:', {
      buyer: order.buyer._id.toString(),
      farmer: order.farmer._id.toString(),
      user: req.user.id
    });

    // Make sure user is the order owner or the farmer
    if (
      order.buyer._id.toString() !== req.user.id && 
      order.farmer._id.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      console.log('Permission denied');
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this order' 
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error in getOrder:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyers only)
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantityOrdered, deliveryAddress } = req.body;

    // Check if user is a buyer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can place orders' });
    }

    // Get the product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if enough quantity is available
    if (quantityOrdered > product.quantity) {
      return res.status(400).json({ 
        message: `Not enough quantity available. Available: ${product.quantity} ${product.unit}` 
      });
    }

    // Calculate total price
    const totalPrice = product.price * quantityOrdered;

    // Create order
    const order = await Order.create({
      product: productId,
      buyer: req.user.id,
      farmer: product.farmer,
      quantityOrdered,
      totalPrice,
      deliveryAddress
    });

    // Populate the order with product data
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'product',
        select: 'cropName price unit image description'
      })
      .populate({
        path: 'buyer',
        select: 'name location phone'
      })
      .populate({
        path: 'farmer',
        select: 'name location phone'
      });

    // Update product quantity
    product.quantity -= quantityOrdered;
    await product.save();

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Farmers or Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user is the farmer for this order or admin
    if (order.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Update status
    order.status = status;
    await order.save();

    // Populate the updated order
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'product',
        select: 'cropName price unit image description'
      })
      .populate({
        path: 'buyer',
        select: 'name location phone'
      })
      .populate({
        path: 'farmer',
        select: 'name location phone'
      });

    res.status(200).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Buyers only)
exports.cancelOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user is the buyer for this order
    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order is already confirmed
    if (order.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that is already confirmed or delivered' 
      });
    }

    // Update status to cancelled
    order.status = 'Cancelled';
    await order.save();

    // Restore product quantity
    const product = await Product.findById(order.product);
    product.quantity += order.quantityOrdered;
    await product.save();

    // Populate the updated order
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'product',
        select: 'cropName price unit image description'
      })
      .populate({
        path: 'buyer',
        select: 'name location phone'
      })
      .populate({
        path: 'farmer',
        select: 'name location phone'
      });

    res.status(200).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
