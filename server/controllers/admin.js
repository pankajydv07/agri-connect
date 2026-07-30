const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select('-password').sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    data: users,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // An admin deleting themselves would lock the platform out of its own console.
  if (user._id.toString() === req.user.id) {
    throw new AppError('You cannot delete your own admin account', 400);
  }

  if (user.role === 'farmer') {
    await Product.deleteMany({ farmer: user._id });
  }

  await Order.deleteMany({ $or: [{ buyer: user._id }, { farmer: user._id }] });

  // `user.remove()` was deprecated in Mongoose 6 and removed in 8 — this
  // codebase runs 7, so it worked today and would break on the next major.
  await User.findByIdAndDelete(user._id);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = asyncHandler(async (req, res) => {
  /**
   * One aggregation per collection instead of eleven sequential
   * countDocuments() calls plus loading every order into memory to sum
   * totalPrice in JS.
   */
  const [userRoles, productCount, orderStats] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Product.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
    ]),
  ]);

  const byRole = userRoles.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
  const byStatus = orderStats.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

  const totalUsers = userRoles.reduce((sum, row) => sum + row.count, 0);
  const totalOrders = orderStats.reduce((sum, row) => sum + row.count, 0);
  const totalSales = orderStats
    .filter((row) => row._id !== 'Cancelled')
    .reduce((sum, row) => sum + row.revenue, 0);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        farmers: byRole.farmer || 0,
        buyers: (byRole.buyer || 0) + (byRole.ngo_buyer || 0),
        ngoBuyers: byRole.ngo_buyer || 0,
        admins: byRole.admin || 0,
      },
      products: productCount,
      orders: {
        total: totalOrders,
        pending: byStatus.Pending || 0,
        confirmed: byStatus.Confirmed || 0,
        delivered: byStatus.Delivered || 0,
        cancelled: byStatus.Cancelled || 0,
      },
      totalSales,
    },
  });
});
