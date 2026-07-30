import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getProduct, updateProduct } from '../../actions/productActions';
import PropTypes from 'prop-types';
import { SpinnerBlock } from '../../components/ui/Spinner';
import FormField, {
  SubmitButton,
  FormErrorSummary,
  validateRequired,
  validatePositiveNumber
} from '../../components/ui/FormField';

const EMPTY_ERRORS = {
  cropName: '',
  description: '',
  quantity: '',
  unit: '',
  price: ''
};

const EditProduct = ({ getProduct, updateProduct, product, loading, match, history }) => {
  const [formData, setFormData] = useState({
    cropName: '',
    description: '',
    quantity: '',
    unit: '',
    price: '',
    availableUntil: '',
    image: null
  });

  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getProduct(match.params.id);
  }, [getProduct, match.params.id]);

  useEffect(() => {
    if (product) {
      const availableUntilDate = new Date(product.availableUntil)
        .toISOString()
        .split('T')[0];

      setFormData({
        cropName: product.cropName || '',
        description: product.description || '',
        quantity: product.quantity || '',
        unit: product.unit || '',
        price: product.price || '',
        availableUntil: availableUntilDate || '',
        image: null
      });
    }
  }, [product]);

  const { cropName, description, quantity, unit, price, availableUntil } = formData;

  const validateField = (name, value) => {
    switch (name) {
      case 'cropName':
        return validateRequired(value, 'Crop name');
      case 'description':
        return validateRequired(value, 'Description');
      case 'quantity':
        return validatePositiveNumber(value, 'Quantity');
      case 'unit':
        return validateRequired(value, 'Unit');
      case 'price':
        return validatePositiveNumber(value, 'Price');
      default:
        return '';
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const onFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] || null }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      cropName: validateRequired(cropName, 'Crop name'),
      description: validateRequired(description, 'Description'),
      quantity: validatePositiveNumber(quantity, 'Quantity'),
      unit: validateRequired(unit, 'Unit'),
      price: validatePositiveNumber(price, 'Price')
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const productData = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          productData.append(key, formData[key]);
        }
      }
      await updateProduct(match.params.id, productData);
      history.push('/farmer/dashboard');
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          'Could not update the product. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SpinnerBlock label="Loading product details…" />;
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Product</h1>

      <FormErrorSummary message={submitError} className="mb-4" />

      <form onSubmit={onSubmit} noValidate>
        <FormField
          name="cropName"
          label="Crop name"
          type="text"
          value={cropName}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.cropName}
          required
          disabled={submitting}
        />

        <FormField
          as="textarea"
          name="description"
          label="Description"
          value={description}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.description}
          required
          disabled={submitting}
        />

        <FormField
          name="quantity"
          label="Quantity"
          type="number"
          value={quantity}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.quantity}
          required
          disabled={submitting}
          min="0"
          step="any"
        />

        <FormField
          name="unit"
          label="Unit"
          type="text"
          value={unit}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.unit}
          required
          disabled={submitting}
          placeholder="e.g. kg, quintal, ton"
        />

        <FormField
          name="price"
          label="Price per unit (₹)"
          type="number"
          value={price}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.price}
          required
          disabled={submitting}
          min="0"
          step="any"
          hint="Price in Indian Rupees (₹)."
        />

        <FormField
          name="availableUntil"
          label="Available until"
          type="date"
          value={availableUntil}
          onChange={onChange}
          disabled={submitting}
        />

        <div className="mb-4">
          <FormField
            name="image"
            label="Replace product image (optional)"
            type="file"
            onChange={onFileChange}
            disabled={submitting}
            accept="image/*"
            hint="Leave blank to keep the existing image."
          />
          {product && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Current image:</p>
              <img
                src="https://images.unsplash.com/photo-1511735643442-503bb3bd348a?fm=jpg&q=60&w=400"
                alt={`Current photo of ${product.cropName}`}
                className="h-24 mt-1 rounded"
              />
            </div>
          )}
        </div>

        <SubmitButton
          loading={submitting}
          loadingLabel="Saving changes…"
          tone="green"
          className="w-full mt-2"
        >
          Update Product
        </SubmitButton>
      </form>
    </div>
  );
};

EditProduct.propTypes = {
  getProduct: PropTypes.func.isRequired,
  updateProduct: PropTypes.func.isRequired,
  product: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

EditProduct.defaultProps = {
  product: null
};

const mapStateToProps = (state) => ({
  product: state.products.product,
  loading: state.products.loading
});

export default connect(mapStateToProps, { getProduct, updateProduct })(EditProduct);
