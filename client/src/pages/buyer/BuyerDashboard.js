import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getOrders } from '../../actions/orderActions';
import OrderList from '../../components/orders/OrderList';

const BuyerDashboard = ({ getOrders, orders, loading, user }) => {
  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const activeOrders = orders.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled');
  const orderHistory = orders.filter(order => order.status === 'Delivered' || order.status === 'Cancelled');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg mb-8 p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Buyer Dashboard</h1>
        <p className="opacity-80">Welcome back, {user?.name || 'Buyer'}! Track your agricultural product orders.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <div className="p-5 bg-blue-50">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">Active Orders</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-3xl font-bold text-gray-800">{activeOrders.length}</p>
            <p className="text-sm text-gray-500 mt-1">Orders in progress</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <div className="p-5 bg-gray-50">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">Completed Orders</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-3xl font-bold text-gray-800">{orderHistory.length}</p>
            <p className="text-sm text-gray-500 mt-1">Past order history</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-full bg-blue-100 text-blue-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Active Orders</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : activeOrders.length > 0 ? (
          <OrderList orders={activeOrders} loading={loading} />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You don't have any active orders</p>
            <a href="/marketplace" className="inline-block mt-4 text-blue-500 hover:text-blue-700 font-medium">Browse Marketplace</a>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-full bg-gray-100 text-gray-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : orderHistory.length > 0 ? (
          <OrderList orders={orderHistory} loading={loading} />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You don't have any completed orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

BuyerDashboard.propTypes = {
  getOrders: PropTypes.func.isRequired,
  orders: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  orders: state.orders.orders,
  loading: state.orders.loading,
  user: state.auth.user
});

export default connect(mapStateToProps, { getOrders })(BuyerDashboard);
