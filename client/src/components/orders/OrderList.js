import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const OrderList = ({ orders, loading }) => {
  if (loading) {
    return <div className="spinner"></div>;
  }

  if (orders.length === 0) {
    return <p>No orders found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Order ID</th>
            <th className="px-4 py-2 text-left">Product</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-left">Total Price</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td className="border px-4 py-2">{order._id}</td>
              <td className="border px-4 py-2">{order.product.cropName}</td>
              <td className="border px-4 py-2">{order.quantityOrdered} {order.product.unit}</td>
              <td className="border px-4 py-2">${order.totalPrice.toFixed(2)}</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">
                <Link to={`/orders/${order._id}`} className="text-blue-500 hover:underline">
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

OrderList.propTypes = {
  orders: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

export default OrderList;
