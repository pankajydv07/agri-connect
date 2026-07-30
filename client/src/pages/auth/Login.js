import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/authActions';
import FormField, {
  SubmitButton,
  FormErrorSummary,
  validateEmail,
  validatePassword
} from '../../components/ui/FormField';

const EMPTY_ERRORS = { email: '', password: '' };

const Login = ({ login, isAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { email, password } = formData;

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the field error as the user types so feedback is immediate.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submitting.
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password)
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await login(email, password);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          'Sign-in failed. Please check your credentials and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Sign In</h1>

      <FormErrorSummary message={submitError} className="mb-4" />

      <form onSubmit={onSubmit} noValidate>
        <FormField
          name="email"
          label="Email address"
          type="email"
          value={email}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.email}
          required
          disabled={submitting}
          autoComplete="email"
        />

        <FormField
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.password}
          required
          disabled={submitting}
          autoComplete="current-password"
        />

        <SubmitButton
          loading={submitting}
          loadingLabel="Signing in…"
          tone="blue"
          className="w-full mt-2"
        >
          Sign In
        </SubmitButton>
      </form>

      <p className="mt-4 text-sm text-gray-700">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

Login.defaultProps = {
  isAuthenticated: false
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);
