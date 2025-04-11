import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Home = ({ isAuthenticated, user }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to AgriConnect</h1>
      <p className="text-xl mb-8">Connecting farmers and buyers directly</p>
      {!isAuthenticated ? (
        <div>
          <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-4">
            Register
          </Link>
          <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Login
          </Link>
        </div>
      ) : (
        <div>
          {user && user.role === 'farmer' && (
            <Link to="/farmer/dashboard" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Farmer Dashboard
            </Link>
          )}
          {user && user.role === 'buyer' && (
            <Link to="/buyer/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Buyer Dashboard
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin/dashboard" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

Home.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user
});

export default connect(mapStateToProps)(Home);
