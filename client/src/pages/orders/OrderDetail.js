import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getOrder, updateOrderStatus, cancelOrder } from '../../actions/orderActions';
import PropTypes from 'prop-types';

const OrderDetail = ({ getOrder, updateOrderStatus, cancelOrder, order, loading, match, auth }) => {
  useEffect(() => {
    getOrder(match.params.id);
  }, [getOrder, match.params.id]);

  if (loading || !order) {
    return <div className="spinner"></div>;
  }

  const onStatusChange = newStatus => {
    updateOrderStatus(order._id, newStatus);
  };

  const onCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(order._id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Order Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="mb-2"><strong>Order ID:</strong> {order._id}</p>
        <p className="mb-2"><strong>Product:</strong> {order.product.cropName}</p>
        <p className="mb-2"><strong>Quantity:</strong> {order.quantityOrdered} {order.product.unit}</p>
        <p className="mb-2"><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
        <p className="mb-2"><strong>Status:</strong> {order.status}</p>
        <p className="mb-2"><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
        <p className="mb-4"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

        {auth.user.role === 'farmer' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Update Order Status</h2>
            <button 
              onClick={() => onStatusChange('Confirmed')} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Confirm Order
            </button>
            <button 
              onClick={() => onStatusChange('Delivered')} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Mark as Delivered
            </button>
          </div>
        )}

        {auth.user.role === 'buyer' && order.status === 'Pending' && (
          <button 
            onClick={onCancel} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

OrderDetail.propTypes = {
  getOrder: PropTypes.func.isRequired,
  updateOrderStatus: PropTypes.func.isRequired,
  cancelOrder: PropTypes.func.isRequired,
  order: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  order: state.orders.order,
  loading: state.orders.loading,
  auth: state.auth
});

export default connect(mapStateToProps, { getOrder, updateOrderStatus, cancelOrder })(OrderDetail);
