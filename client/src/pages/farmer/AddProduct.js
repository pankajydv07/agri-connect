import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addProduct } from '../../actions/productActions';
import PropTypes from 'prop-types';
import FormField, {
  SubmitButton,
  FormErrorSummary,
  validateRequired,
  validatePositiveNumber,
  validateFutureDate
} from '../../components/ui/FormField';

const EMPTY_ERRORS = {
  cropName: '',
  description: '',
  quantity: '',
  unit: '',
  price: '',
  availableUntil: ''
};

const AddProduct = ({ addProduct, history }) => {
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
      case 'availableUntil':
        return validateFutureDate(value, 'Available until date');
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
    if (e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      cropName: validateRequired(cropName, 'Crop name'),
      description: validateRequired(description, 'Description'),
      quantity: validatePositiveNumber(quantity, 'Quantity'),
      unit: validateRequired(unit, 'Unit'),
      price: validatePositiveNumber(price, 'Price'),
      availableUntil: validateFutureDate(availableUntil, 'Available until date')
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const productData = new FormData();
      productData.append('cropName', cropName);
      productData.append('description', description);
      productData.append('quantity', quantity);
      productData.append('unit', unit);
      productData.append('price', price);
      productData.append('availableUntil', availableUntil);
      if (formData.image) {
        productData.append('image', formData.image);
      }
      await addProduct(productData, history);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          'Could not add the product. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Add New Product</h1>

      <FormErrorSummary message={submitError} className="mb-4" />

      <form onSubmit={onSubmit} encType="multipart/form-data" noValidate>
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
          placeholder="e.g. Tomatoes"
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
          placeholder="Describe the crop, quality, growing method, etc."
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
          hint="Enter the amount you have available to sell."
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
          onBlur={onBlur}
          error={errors.availableUntil}
          required
          disabled={submitting}
        />

        <FormField
          name="image"
          label="Product image (optional)"
          type="file"
          onChange={onFileChange}
          disabled={submitting}
          accept="image/*"
          hint="Upload a clear photo of your produce."
        />

        <SubmitButton
          loading={submitting}
          loadingLabel="Adding product…"
          tone="green"
          className="w-full mt-2"
        >
          Add Product
        </SubmitButton>
      </form>
    </div>
  );
};

AddProduct.propTypes = {
  addProduct: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

export default connect(null, { addProduct })(AddProduct);
