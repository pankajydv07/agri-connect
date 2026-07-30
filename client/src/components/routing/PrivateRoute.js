import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Spinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="spinner"></div>
  </div>
);

const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading, user },
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      if (loading) return <Spinner />;

      if (!isAuthenticated) return <Redirect to="/login" />;

      // Authenticated but the profile has not landed yet (the window between
      // LOGIN_SUCCESS and loadUser resolving). Wait rather than bounce.
      if (!user) return <Spinner />;

      return <Component {...props} />;
    }}
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
