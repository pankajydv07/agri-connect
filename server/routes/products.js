const express = require('express');
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('farmer', 'admin'), upload.single('image'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('farmer', 'admin'), upload.single('image'), updateProduct)
  .delete(protect, authorize('farmer', 'admin'), deleteProduct);

module.exports = router;
