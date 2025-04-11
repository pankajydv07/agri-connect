import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const RoleRoute = ({ 
  component: Component, 
  auth: { isAuthenticated, loading, user }, 
  role,
  ...rest 
}) => (
  <Route
    {...rest}
    render={props =>
      loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      ) : isAuthenticated && user.role === role ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

RoleRoute.propTypes = {
  auth: PropTypes.object.isRequired,
  role: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(RoleRoute);
