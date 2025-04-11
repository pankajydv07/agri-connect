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
    <div>
      <h1 className="text-3xl font-bold mb-4">Buyer Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Orders</h2>
        <OrderList orders={activeOrders} loading={loading} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        <OrderList orders={orderHistory} loading={loading} />
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
