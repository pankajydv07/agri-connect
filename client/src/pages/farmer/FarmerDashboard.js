import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getProducts } from '../../actions/productActions';
import { getOrders } from '../../actions/orderActions';
import ProductList from '../../components/products/ProductList';
import OrderList from '../../components/orders/OrderList';

const FarmerDashboard = ({ getProducts, getOrders, products, orders, loading, user }) => {
  useEffect(() => {
    if (user && user._id) {
      getProducts(`?farmer=${user._id}`);
      getOrders();
    }
  }, [getProducts, getOrders, user]);

  const totalEarnings = orders
    .filter(order => order.status === 'Delivered')
    .reduce((total, order) => total + order.totalPrice, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg shadow-lg mb-8 p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Farmer Dashboard</h1>
        <p className="opacity-80">Welcome back, {user?.name || 'Farmer'}! Manage your agricultural products and orders.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <div className="p-5 bg-green-50">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">Total Listings</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-3xl font-bold text-gray-800">{products.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active products in marketplace</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <div className="p-5 bg-blue-50">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">Total Orders</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
            <p className="text-sm text-gray-500 mt-1">Orders received from buyers</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <div className="p-5 bg-yellow-50">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">Total Earnings</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-3xl font-bold text-gray-800">${totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Revenue from delivered orders</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Products</h2>
          <Link 
            to="/farmer/products/add" 
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
          </div>
        ) : (
          <ProductList products={products} loading={loading} />
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
          </div>
        ) : (
          <OrderList orders={orders} loading={loading} />
        )}
      </div>
    </div>
  );
};

FarmerDashboard.propTypes = {
  getProducts: PropTypes.func.isRequired,
  getOrders: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  orders: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  products: state.products.products,
  orders: state.orders.orders,
  loading: state.products.loading || state.orders.loading,
  user: state.auth.user
});

export default connect(mapStateToProps, { getProducts, getOrders })(FarmerDashboard);
