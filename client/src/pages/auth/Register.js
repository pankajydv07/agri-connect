import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { register } from '../../actions/authActions';
import PropTypes from 'prop-types';
import FormField, {
  SubmitButton,
  FormErrorSummary,
  validateRequired,
  validateEmail,
  validatePassword,
  validatePhone
} from '../../components/ui/FormField';

const EMPTY_ERRORS = {
  name: '',
  email: '',
  password: '',
  password2: '',
  location: '',
  phone: ''
};

const Register = ({ register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'buyer',
    location: '',
    phone: ''
  });

  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { name, email, password, password2, role, location, phone } = formData;

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        return validateRequired(value, 'Full name');
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'password2':
        return value !== formData.password ? 'Passwords do not match.' : '';
      case 'location':
        return validateRequired(value, 'Location');
      case 'phone':
        return validatePhone(value);
      default:
        return '';
    }
  };

  const onChange = (e) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const onBlur = (e) => {
    const { name: fieldName, value } = e.target;
    setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, value) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      name: validateRequired(name, 'Full name'),
      email: validateEmail(email),
      password: validatePassword(password),
      password2: password2 !== password ? 'Passwords do not match.' : '',
      location: validateRequired(location, 'Location'),
      phone: validatePhone(phone)
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await register({ name, email, password, role, location, phone });
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          'Registration failed. Please check your details and try again.'
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Sign Up</h1>

      <FormErrorSummary message={submitError} className="mb-4" />

      <form onSubmit={onSubmit} noValidate>
        <FormField
          name="name"
          label="Full name"
          type="text"
          value={name}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.name}
          required
          disabled={submitting}
          autoComplete="name"
        />

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
          hint="Minimum 6 characters."
          required
          disabled={submitting}
          autoComplete="new-password"
        />

        <FormField
          name="password2"
          label="Confirm password"
          type="password"
          value={password2}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.password2}
          required
          disabled={submitting}
          autoComplete="new-password"
        />

        <FormField
          as="select"
          name="role"
          label="Account type"
          value={role}
          onChange={onChange}
          disabled={submitting}
        >
          <option value="buyer">Buyer</option>
          <option value="ngo_buyer">NGO Buyer</option>
          <option value="farmer">Farmer</option>
        </FormField>

        <FormField
          name="location"
          label="Location"
          type="text"
          value={location}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.location}
          hint="Village, district or city where you operate."
          required
          disabled={submitting}
          autoComplete="address-level2"
        />

        <FormField
          name="phone"
          label="Mobile number"
          type="tel"
          value={phone}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.phone}
          hint="10-digit Indian mobile number, e.g. 9876543210."
          required
          disabled={submitting}
          autoComplete="tel"
        />

        <SubmitButton
          loading={submitting}
          loadingLabel="Creating account…"
          tone="green"
          className="w-full mt-2"
        >
          Register
        </SubmitButton>
      </form>

      <p className="mt-4 text-sm text-gray-700">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
};

Register.propTypes = {
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

Register.defaultProps = {
  isAuthenticated: false
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { register })(Register);
