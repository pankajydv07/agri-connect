const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { productImageUpload } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(validate(schemas.listQuery, 'query'), getProducts)
  .post(
    protect,
    authorize('farmer'),
    productImageUpload.single('image'),
    validate(schemas.createProduct),
    createProduct
  );

router
  .route('/:id')
  .get(validate(schemas.idParam, 'params'), getProduct)
  // 'admin' added: the controller already allowed admins through, but the route
  // guard rejected them first, so the two disagreed about who may edit/delete.
  .put(
    protect,
    authorize('farmer', 'admin'),
    validate(schemas.idParam, 'params'),
    productImageUpload.single('image'),
    validate(schemas.updateProduct),
    updateProduct
  )
  .delete(
    protect,
    authorize('farmer', 'admin'),
    validate(schemas.idParam, 'params'),
    deleteProduct
  );

router
  .route('/:id/status')
  .put(
    protect,
    authorize('farmer', 'admin'),
    validate(schemas.idParam, 'params'),
    validate(schemas.updateProductStatus),
    updateProductStatus
  );

module.exports = router;
