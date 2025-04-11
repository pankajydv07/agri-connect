import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/authActions';

const Navbar = ({ auth: { isAuthenticated, loading, user }, logout }) => {
  const farmerLinks = (
    <Fragment>
      <Link to="/farmer/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Dashboard
      </Link>
      <Link to="/farmer/products/add" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Add Product
      </Link>
    </Fragment>
  );

  const buyerLinks = (
    <Fragment>
      <Link to="/buyer/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Dashboard
      </Link>
      <Link to="/marketplace" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Marketplace
      </Link>
    </Fragment>
  );

  const adminLinks = (
    <Fragment>
      <Link to="/admin/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Admin Dashboard
      </Link>
    </Fragment>
  );

  const authLinks = (
    <Fragment>
      {user && user.role === 'farmer' && farmerLinks}
      {user && user.role === 'buyer' && buyerLinks}
      {user && user.role === 'admin' && adminLinks}
      <button 
        onClick={logout} 
        className="text-white hover:text-green-200 px-3 py-2 rounded"
      >
        Logout
      </button>
    </Fragment>
  );

  const guestLinks = (
    <Fragment>
      <Link to="/marketplace" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Marketplace
      </Link>
      <Link to="/register" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Register
      </Link>
      <Link to="/login" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Login
      </Link>
    </Fragment>
  );

  return (
    <nav className="bg-green-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-white font-bold text-xl">
            AgriConnect
          </Link>
          <div className="flex">
            {!loading && (
              <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(Navbar);
