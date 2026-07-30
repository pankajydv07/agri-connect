const Product = require('../models/Product');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { destroy, publicIdFromUrl } = require('../utils/cloudinary');
const logger = require('../config/logger');

/** Fields a farmer is allowed to write. Notably excludes `farmer`. */
const WRITABLE_FIELDS = [
  'cropName',
  'description',
  'quantity',
  'unit',
  'price',
  'availableUntil',
  'status',
];

const pickWritable = (body) =>
  WRITABLE_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

/**
 * Builds a MongoDB filter from validated query params.
 *
 * The original stringified `req.query` and regex-replaced `gt|gte|lt|lte|in`
 * into `$gt`-style operators, promoting arbitrary user input into query
 * operators. Every filter is now explicit and typed.
 */
const buildProductFilter = async (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.farmer) filter.farmer = query.farmer;

  if (query.cropName) {
    // Escape regex metacharacters so a crafted name can't build a catastrophic pattern.
    const safe = query.cropName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.cropName = new RegExp(safe, 'i');
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  // `location` lives on the farmer, not the product. The old code passed it
  // straight to Product.find(), where it silently matched nothing — the
  // marketplace location filter never actually worked.
  if (query.location) {
    const safe = query.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const farmers = await User.find({ location: new RegExp(safe, 'i') }).select('_id').lean();
    filter.farmer = { $in: farmers.map((f) => f._id) };
  }

  return filter;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const { page, limit, sort, select } = req.query;
  const filter = await buildProductFilter(req.query);

  const skip = (page - 1) * limit;

  let query = Product.find(filter)
    .populate({ path: 'farmer', select: 'name location phone' })
    .sort(sort ? sort.split(',').join(' ') : '-createdAt')
    .skip(skip)
    .limit(limit);

  if (select) {
    query = query.select(select.split(',').join(' '));
  }

  // Run the page and the count concurrently rather than serially.
  const [products, total] = await Promise.all([
    query.lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: skip + products.length < total,
      hasPrev: page > 1,
    },
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'farmer',
    select: 'name location phone',
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({ success: true, data: product });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmers only)
exports.createProduct = asyncHandler(async (req, res) => {
  const payload = pickWritable(req.body);

  // Ownership is derived from the token, never from the request body.
  payload.farmer = req.user.id;

  // With CloudinaryStorage, multer puts the secure URL on `path`.
  if (req.file) {
    payload.image = req.file.path;
  }

  const product = await Product.create(payload);

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner farmer or admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this product', 403);
  }

  // Allow-listed fields only. The original passed `req.body` wholesale into
  // findByIdAndUpdate, so a farmer could send {"farmer": "<other id>"} and
  // reassign someone else's listing to themselves.
  const updates = pickWritable(req.body);
  const previousImage = product.image;

  if (req.file) {
    updates.image = req.file.path;
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  // Replaced image: drop the old asset so paid storage isn't orphaned.
  if (req.file && previousImage) {
    try {
      await destroy(publicIdFromUrl(previousImage));
    } catch (error) {
      logger.warn({ err: error, productId: req.params.id }, 'Failed to delete replaced image');
    }
  }

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner farmer or admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this product', 403);
  }

  // findOneAndDelete triggers the cascade hook that removes related orders.
  await Product.findOneAndDelete({ _id: req.params.id });

  if (product.image) {
    try {
      await destroy(publicIdFromUrl(product.image));
    } catch (error) {
      logger.warn({ err: error, productId: req.params.id }, 'Failed to delete product image');
    }
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Update product status
// @route   PUT /api/products/:id/status
// @access  Private (Owner farmer or admin)
exports.updateProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this product', 403);
  }

  product.status = req.body.status;
  await product.save();

  res.status(200).json({ success: true, data: product });
});
