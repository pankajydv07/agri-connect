import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Spinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="spinner"></div>
  </div>
);

const RoleRoute = ({
  component: Component,
  auth: { isAuthenticated, loading, user },
  role,
  ...rest
}) => {
  const hasRequiredRole = () => {
    // `user` is null whenever the session failed to resolve (bad/expired
    // token), so it must be checked before reading `user.role`.
    if (!user || !user.role) return false;

    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  return (
    <Route
      {...rest}
      render={props => {
        if (loading) return <Spinner />;

        if (!isAuthenticated) return <Redirect to="/login" />;

        // Authenticated but the profile has not landed yet (the window between
        // LOGIN_SUCCESS and loadUser resolving). Wait rather than bounce.
        if (!user) return <Spinner />;

        if (!hasRequiredRole()) return <Redirect to="/login" />;

        return <Component {...props} />;
      }}
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
