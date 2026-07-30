import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getProduct } from '../../actions/productActions';
import { createOrder } from '../../actions/orderActions';
import PropTypes from 'prop-types';
import { SpinnerBlock } from '../../components/ui/Spinner';
import { SubmitButton } from '../../components/ui/FormField';
import Money from '../../components/ui/Money';

const ProductDetail = ({ getProduct, createOrder, product, loading, match, history, auth }) => {
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    getProduct(match.params.id);
  }, [getProduct, match.params.id]);

  const onChange = (e) => setOrderQuantity(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (auth.isAuthenticated && auth.user.role === 'buyer') {
      setSubmitting(true);
      setOrderError('');
      try {
        await createOrder(
          {
            productId: product._id,
            quantityOrdered: orderQuantity,
            deliveryAddress: auth.user.location
          },
          history
        );
      } catch (err) {
        setOrderError(
          err?.response?.data?.message || 'Could not place the order. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      history.push('/login');
    }
  };

  if (loading || !product) {
    return <SpinnerBlock label="Loading product details…" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.cropName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src="https://images.unsplash.com/photo-1511735643442-503bb3bd348a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D"
            alt={`Photo of ${product.cropName}`}
            className="w-full rounded-lg shadow-md"
          />
        </div>
        <div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          {/* Money component uses en-IN locale and ₹ */}
          <p className="text-xl font-bold mb-2">
            <Money value={product.price} perUnit={product.unit} />
          </p>
          <p className="mb-2">
            Available Quantity: {product.quantity} {product.unit}
          </p>
          <p className="mb-4">
            Available until: {new Date(product.availableUntil).toLocaleDateString('en-IN')}
          </p>

          {orderError && (
            <div role="alert" className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {orderError}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-700">
                Order Quantity ({product.unit})
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={orderQuantity}
                onChange={onChange}
                min="1"
                max={product.quantity}
                required
                disabled={submitting}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
            <SubmitButton
              loading={submitting}
              loadingLabel="Placing order…"
              tone="green"
              className="w-full"
            >
              Place Order
            </SubmitButton>
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
  auth: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

ProductDetail.defaultProps = {
  product: null
};

const mapStateToProps = (state) => ({
  product: state.products.product,
  loading: state.products.loading,
  auth: state.auth
});

export default connect(mapStateToProps, { getProduct, createOrder })(ProductDetail);
