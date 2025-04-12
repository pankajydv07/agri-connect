import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUsers, getStats } from '../../actions/adminActions';
import UserList from '../../components/admin/UserList';

const AdminDashboard = ({ getUsers, getStats, users, stats, loading }) => {
  useEffect(() => {
    getUsers();
    getStats();
  }, [getUsers, getStats]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Total Users</h2>
              <p className="text-3xl font-bold">{stats.users.total}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Total Products</h2>
              <p className="text-3xl font-bold">{stats.products}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
              <p className="text-3xl font-bold">{stats.orders.total}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Total Sales</h2>
              <p className="text-3xl font-bold">₹{stats.totalSales.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <UserList users={users} />
          </div>
        </>
      )}
    </div>
  );
};

AdminDashboard.propTypes = {
  getUsers: PropTypes.func.isRequired,
  getStats: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  stats: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  users: state.admin.users,
  stats: state.admin.stats,
  loading: state.admin.loading
});

export default connect(mapStateToProps, { getUsers, getStats })(AdminDashboard);
