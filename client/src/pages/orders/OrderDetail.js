import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getOrder, updateOrderStatus, cancelOrder } from '../../actions/orderActions';
import PropTypes from 'prop-types';

const OrderDetail = ({ getOrder, updateOrderStatus, cancelOrder, order, loading, match, auth }) => {
  useEffect(() => {
    getOrder(match.params.id);
  }, [getOrder, match.params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Order not found or you don't have permission to view it.</p>
      </div>
    );
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Product Information</h2>
            <div className="mb-4">
              <img 
                src="https://images.unsplash.com/photo-1511735643442-503bb3bd348a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D"
                alt={order.product ? order.product.cropName : 'No Image Available'} 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <p className="mb-2"><strong>Product Name:</strong> {order.product ? order.product.cropName : 'N/A'}</p>
            <p className="mb-2"><strong>Description:</strong> {order.product ? order.product.description : 'N/A'}</p>
            <p className="mb-2"><strong>Price per Unit:</strong> {order.product ? `₹${order.product.price.toFixed(2)}` : 'N/A'}</p>
            <p className="mb-2"><strong>Unit:</strong> {order.product ? order.product.unit : 'N/A'}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Order Information</h2>
            <p className="mb-2"><strong>Order ID:</strong> {order._id}</p>
            <p className="mb-2"><strong>Quantity Ordered:</strong> {order.product ? `${order.quantityOrdered} ${order.product.unit}` : 'N/A'}</p>
            <p className="mb-2"><strong>Total Price:</strong> ₹{order.totalPrice.toFixed(2)}</p>
            <p className="mb-2"><strong>Status:</strong> {order.status}</p>
            <p className="mb-2"><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
            <p className="mb-4"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Buyer Information</h2>
              <p className="mb-2"><strong>Name:</strong> {order.buyer.name}</p>
              <p className="mb-2"><strong>Location:</strong> {order.buyer.location}</p>
              <p className="mb-2"><strong>Phone:</strong> {order.buyer.phone}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Seller Information</h2>
              <p className="mb-2"><strong>Name:</strong> {order.farmer.name}</p>
              <p className="mb-2"><strong>Location:</strong> {order.farmer.location}</p>
              <p className="mb-2"><strong>Phone:</strong> {order.farmer.phone}</p>
            </div>

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
