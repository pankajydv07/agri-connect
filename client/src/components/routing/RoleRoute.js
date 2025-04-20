import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const RoleRoute = ({ 
  component: Component, 
  auth: { isAuthenticated, loading, user }, 
  role,
  ...rest 
}) => {
  const checkRole = () => {
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
          </div>
        ) : isAuthenticated && checkRole() ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

RoleRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  role: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(RoleRoute);
