import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getProduct } from '../../actions/productActions';
import { createOrder } from '../../actions/orderActions';
import PropTypes from 'prop-types';

const ProductDetail = ({ getProduct, createOrder, product, loading, match, history, auth }) => {
  useEffect(() => {
    getProduct(match.params.id);
  }, [getProduct, match.params.id]);

  const [orderQuantity, setOrderQuantity] = useState(1);

  const onChange = e => setOrderQuantity(e.target.value);

  const onSubmit = e => {
    e.preventDefault();
    if (auth.isAuthenticated && auth.user.role === 'buyer') {
      createOrder({
        productId: product._id,
        quantityOrdered: orderQuantity,
        deliveryAddress: auth.user.location // You might want to add a separate input for this
      }, history);
    } else {
      history.push('/login');
    }
  };

  if (loading || !product) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{product.cropName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src="https://images.unsplash.com/photo-1511735643442-503bb3bd348a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D" alt={product.cropName} className="w-full rounded-lg shadow-md" />
        </div>
        <div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl font-bold mb-2">₹{product.price.toFixed(2)} / {product.unit}</p>
          <p className="mb-2">Available Quantity: {product.quantity} {product.unit}</p>
          <p className="mb-4">Available until: {new Date(product.availableUntil).toLocaleDateString()}</p>
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label htmlFor="quantity" className="block mb-2">Order Quantity ({product.unit})</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={orderQuantity}
                onChange={onChange}
                min="1"
                max={product.quantity}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Place Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  getProduct: PropTypes.func.isRequired,
  createOrder: PropTypes.func.isRequired,
  product: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  product: state.products.product,
  loading: state.products.loading,
  auth: state.auth
});

export default connect(mapStateToProps, { getProduct, createOrder })(ProductDetail);
