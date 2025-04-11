const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's products if they are a farmer
    if (user.role === 'farmer') {
      await Product.deleteMany({ farmer: user._id });
    }

    // Delete user's orders
    await Order.deleteMany({ 
      $or: [{ buyer: user._id }, { farmer: user._id }] 
    });

    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const farmerCount = await User.countDocuments({ role: 'farmer' });
    const buyerCount = await User.countDocuments({ role: 'buyer' });
    
    const productCount = await Product.countDocuments();
    
    const orderCount = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'Confirmed' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    
    // Calculate total sales
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalSales = orders.reduce((total, order) => total + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: userCount,
          farmers: farmerCount,
          buyers: buyerCount
        },
        products: productCount,
        orders: {
          total: orderCount,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalSales
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
