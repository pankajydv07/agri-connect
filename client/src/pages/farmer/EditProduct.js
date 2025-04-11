import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getProduct, updateProduct } from '../../actions/productActions';
import PropTypes from 'prop-types';

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

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const onSubmit = e => {
    e.preventDefault();
    const productData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        productData.append(key, formData[key]);
      }
    }
    updateProduct(match.params.id, productData);
    history.push('/farmer/dashboard');
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Crop Name"
            name="cropName"
            value={cropName}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Description"
            name="description"
            value={description}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          ></textarea>
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Quantity"
            name="quantity"
            value={quantity}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Unit (e.g., kg, ton)"
            name="unit"
            value={unit}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Price per unit"
            name="price"
            value={price}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            name="availableUntil"
            value={availableUntil}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <input
            type="file"
            name="image"
            onChange={onFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border rounded-md"
          />
          {product && product.image && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current image:</p>
              <img 
                src={product.image} 
                alt={product.cropName} 
                className="h-24 mt-1 rounded"
              />
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Update Product
        </button>
      </form>
    </div>
  );
};

EditProduct.propTypes = {
  getProduct: PropTypes.func.isRequired,
  updateProduct: PropTypes.func.isRequired,
  product: PropTypes.object,
  loading: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  product: state.products.product,
  loading: state.products.loading
});

export default connect(mapStateToProps, { getProduct, updateProduct })(EditProduct);
