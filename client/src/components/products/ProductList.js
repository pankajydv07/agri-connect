import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { deleteProduct } from '../../actions/productActions';

const ProductList = ({ products, loading, deleteProduct, user }) => {
  if (loading) {
    return <div className="spinner"></div>;
  }

  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Crop Name</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Available Until</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td className="border px-4 py-2">{product.cropName}</td>
              <td className="border px-4 py-2">{product.quantity} {product.unit}</td>
              <td className="border px-4 py-2">${product.price.toFixed(2)}</td>
              <td className="border px-4 py-2">{new Date(product.availableUntil).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <Link to={`/products/${product._id}`} className="text-blue-500 hover:underline mr-2">
                  View
                </Link>
                {user && (user.role === 'farmer' || user.role === 'admin') && (
                  <>
                    <Link to={`/farmer/products/edit/${product._id}`} className="text-green-500 hover:underline mr-2">
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  deleteProduct: PropTypes.func.isRequired,
  user: PropTypes.object
};

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps, { deleteProduct })(ProductList);
