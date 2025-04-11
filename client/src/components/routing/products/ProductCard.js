import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src="https://images.unsplash.com/photo-1511735643442-503bb3bd348a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D" alt={product.cropName} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{product.cropName}</h3>
        <p className="text-gray-600 mb-2">{product.description.substring(0, 100)}...</p>
        <p className="text-lg font-bold mb-2">${product.price.toFixed(2)} / {product.unit}</p>
        <p className="text-sm text-gray-500 mb-4">Available until: {new Date(product.availableUntil).toLocaleDateString()}</p>
        <Link to={`/products/${product._id}`} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          View Details
        </Link>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.object.isRequired
};

export default ProductCard;
