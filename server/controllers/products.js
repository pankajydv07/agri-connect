const Product = require('../models/Product');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Product.find(JSON.parse(queryStr)).populate({
      path: 'farmer',
      select: 'name location phone'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: 'farmer',
      select: 'name location phone'
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmers only)
exports.createProduct = async (req, res) => {
  try {
    // Add user to req.body
    req.body.farmer = req.user.id;

    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can add products' });
    }

    // Upload image to Cloudinary if present
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'agri-connect/products'
      });
      req.body.image = result.secure_url;
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmers only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is the product owner
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmers only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is the product owner
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete image from Cloudinary if exists
  

    // Delete product using findByIdAndDelete
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get farmer products
// @route

// @desc    Update product status
// @route   PUT /api/products/:id/status
// @access  Private (Farmers only)
exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is the product owner
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
