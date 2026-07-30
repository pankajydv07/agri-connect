import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUsers, getStats } from '../../actions/adminActions';
import UserList from '../../components/admin/UserList';
import { SpinnerBlock } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/EmptyState';
import { formatINR } from '../../components/ui/Money';

const AdminDashboard = ({ getUsers, getStats, users, stats, loading }) => {
  const [fetchError, setFetchError] = useState('');

  const doFetch = async () => {
    setFetchError('');
    try {
      await Promise.all([getUsers(), getStats()]);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message ||
          'Could not load admin data. Check your connection and try again.'
      );
    }
  };

  useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <SpinnerBlock label="Loading admin data…" />;
  }

  if (fetchError) {
    return <ErrorState title="Could not load admin data" description={fetchError} onRetry={doFetch} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Users</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.users?.total ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Products</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.products ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Orders</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.orders?.total ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Total Sales</h2>
          {/* formatINR uses en-IN locale — correct lakh/crore grouping */}
          <p className="text-3xl font-bold text-gray-900">{formatINR(stats.totalSales ?? 0)}</p>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">User Management</h2>
        <UserList users={users} />
      </section>
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

const mapStateToProps = (state) => ({
  users: state.admin.users,
  stats: state.admin.stats,
  loading: state.admin.loading
});

export default connect(mapStateToProps, { getUsers, getStats })(AdminDashboard);
