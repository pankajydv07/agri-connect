const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus
} = require('../controllers/products');
const upload = require('../middleware/multer');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('farmer'), upload.single('image'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('farmer'), upload.single('image'), updateProduct)
  .delete(protect, authorize('farmer'), deleteProduct);

router
  .route('/:id/status')
  .put(protect, authorize('farmer'), updateProductStatus);

module.exports = router;
