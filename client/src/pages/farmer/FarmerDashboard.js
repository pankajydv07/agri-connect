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
    <div>
      <h1 className="text-3xl font-bold mb-4">Farmer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Listings</h2>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Earnings</h2>
          <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Products</h2>
        <Link to="/farmer/products/add" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
          Add New Product
        </Link>
        <ProductList products={products} loading={loading} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <OrderList orders={orders} loading={loading} />
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
