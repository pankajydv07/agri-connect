import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addProduct } from '../../actions/productActions';
import PropTypes from 'prop-types';

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

  const { cropName, description, quantity, unit, price, availableUntil } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    console.log('File selected:', e.target.files[0]);
    setFormData({ ...formData, image: e.target.files[0] });
  };
  

  const onSubmit = e => {
    e.preventDefault();
    const productData = new FormData();
    for (const key in formData) {
      productData.append(key, formData[key]);
    }
    addProduct(productData, history);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Add New Product</h1>
      <form onSubmit={onSubmit} encType="multipart/form-data">
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
        </div>
        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Add Product
        </button>
      </form>
    </div>
  );
};

AddProduct.propTypes = {
  addProduct: PropTypes.func.isRequired
};

export default connect(null, { addProduct })(AddProduct);
