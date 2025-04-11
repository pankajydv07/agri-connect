import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getProducts, deleteProduct, updateProductStatus } from '../../actions/productActions';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Products = ({ getProducts, deleteProduct, updateProductStatus, product: { products, loading } }) => {
  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleStatusChange = (id, status) => {
    updateProductStatus(id, status);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link 
          to="/farmer/add-product" 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add New Product
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product._id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
            <img 
              src={product.image} 
              alt={product.cropName} 
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{product.cropName}</h2>
              <span className={`px-2 py-1 rounded-full text-sm ${
                product.status === 'Available' ? 'bg-green-100 text-green-800' :
                product.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {product.status}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium">{product.quantity} {product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">₹{product.price}/{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Until</p>
                <p className="font-medium">{new Date(product.availableUntil).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select
                value={product.status}
                onChange={(e) => handleStatusChange(product._id, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Link
                to={`/farmer/edit-product/${product._id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1 text-center"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Products.propTypes = {
  getProducts: PropTypes.func.isRequired,
  deleteProduct: PropTypes.func.isRequired,
  updateProductStatus: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  product: state.product
});

export default connect(mapStateToProps, { getProducts, deleteProduct, updateProductStatus })(Products); 