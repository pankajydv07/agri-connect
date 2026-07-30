import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

/**
 * Labelled form control with inline validation messaging.
 *
 * Every field gets a real <label htmlFor> (placeholders alone break screen
 * readers and browser autofill), and errors are rendered next to the field they
 * belong to, wired up with aria-invalid / aria-describedby, instead of only in
 * a global banner at the top of the page that scrolls out of view on a phone.
 *
 * Supports `as="input" | "textarea" | "select"`.
 */
const BASE_CONTROL =
  'w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:text-gray-500';
const VALID_CONTROL = 'border-gray-300 focus:ring-green-500 focus:border-green-500';
const INVALID_CONTROL = 'border-red-500 focus:ring-red-500 focus:border-red-500';

const WarningIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"
    />
  </svg>
);

WarningIcon.propTypes = { className: PropTypes.string };
WarningIcon.defaultProps = { className: 'h-4 w-4' };

const FormField = React.forwardRef(
  (
    {
      id,
      name,
      label,
      as,
      type,
      value,
      onChange,
      onBlur,
      error,
      hint,
      required,
      disabled,
      children,
      className,
      controlClassName,
      ...rest
    },
    ref
  ) => {
    const fieldId = id || name;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

    const controlClasses = `${BASE_CONTROL} ${error ? INVALID_CONTROL : VALID_CONTROL} ${controlClassName}`;

    const sharedProps = {
      ...rest,
      id: fieldId,
      name,
      ref,
      onChange,
      onBlur,
      required,
      disabled,
      'aria-invalid': error ? 'true' : undefined,
      'aria-describedby': describedBy || undefined,
      className: controlClasses
    };

    let control;
    if (as === 'textarea') {
      control = <textarea {...sharedProps} value={value} />;
    } else if (as === 'select') {
      control = (
        <select {...sharedProps} value={value}>
          {children}
        </select>
      );
    } else if (type === 'file') {
      // A file input must stay uncontrolled: passing `value` would throw.
      control = <input {...sharedProps} type="file" />;
    } else {
      control = <input {...sharedProps} type={type} value={value} />;
    }

    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required ? (
            <>
              <span aria-hidden="true" className="ml-0.5 text-red-600">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </label>
        {control}
        {hint ? (
          <p id={hintId} className="mt-1 text-xs text-gray-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="mt-1 flex items-start gap-1 text-sm font-medium text-red-700">
            <WarningIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

FormField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  as: PropTypes.oneOf(['input', 'textarea', 'select']),
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  /** Inline error message. Presence also flips aria-invalid. */
  error: PropTypes.string,
  /** Always-visible help text (format examples, units, etc.). */
  hint: PropTypes.node,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  controlClassName: PropTypes.string
};

FormField.defaultProps = {
  id: undefined,
  as: 'input',
  type: 'text',
  value: undefined,
  onChange: undefined,
  onBlur: undefined,
  error: '',
  hint: '',
  required: false,
  disabled: false,
  children: null,
  className: '',
  controlClassName: ''
};

/**
 * Form-level message shown next to the submit control. Screen readers announce
 * it when it appears; sighted users on small screens see it without scrolling
 * back to the top of the page for the global <Alert /> banner.
 */
export const FormErrorSummary = ({ message, className }) =>
  message ? (
    <div
      role="alert"
      className={`mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-800 ${className}`}
    >
      <WarningIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  ) : null;

FormErrorSummary.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

FormErrorSummary.defaultProps = {
  message: '',
  className: ''
};

/**
 * Submit button that cannot be double-fired: while `loading` is true it is
 * disabled and shows a spinner plus a "working" label.
 */
export const SubmitButton = ({
  loading,
  loadingLabel,
  children,
  className,
  tone,
  disabled,
  ...rest
}) => {
  const tones = {
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  };

  return (
    <button
      type="submit"
      {...rest}
      disabled={loading || disabled}
      aria-busy={loading ? 'true' : 'false'}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 ${
        tones[tone] || tones.green
      } ${className}`}
    >
      {loading ? (
        <>
          <Spinner size="sm" tone="white" label={null} className="mr-2" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
};

SubmitButton.propTypes = {
  loading: PropTypes.bool,
  loadingLabel: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  tone: PropTypes.oneOf(['green', 'blue']),
  disabled: PropTypes.bool
};

SubmitButton.defaultProps = {
  loading: false,
  loadingLabel: 'Please wait…',
  className: '',
  tone: 'green',
  disabled: false
};

/* ------------------------------------------------------------------ *
 * Validation helpers shared by the auth and product forms.
 * They return an error string, or '' when the value is acceptable.
 * ------------------------------------------------------------------ */

export const validateRequired = (value, label = 'This field') =>
  String(value ?? '').trim() ? '' : `${label} is required.`;

export const validateEmail = value => {
  const email = String(value ?? '').trim();
  if (!email) return 'Email address is required.';
  // Deliberately permissive: one @, no spaces, a dot in the domain.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Enter a valid email address, for example name@example.com.';
  }
  return '';
};

export const validatePassword = (value, { minLength = 6 } = {}) => {
  const password = String(value ?? '');
  if (!password) return 'Password is required.';
  if (password.length < minLength) return `Password must be at least ${minLength} characters.`;
  return '';
};

export const validatePhone = value => {
  const phone = String(value ?? '').trim();
  if (!phone) return 'Phone number is required.';
  const digits = phone.replace(/[\s\-()]/g, '');
  // Indian mobile numbers: 10 digits starting 6-9, optionally +91 / 91 / 0 prefixed.
  if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(digits)) {
    return 'Enter a 10-digit mobile number, for example 9876543210.';
  }
  return '';
};

export const validatePositiveNumber = (
  value,
  label = 'Value',
  { integer = false, max = undefined, min = 0 } = {}
) => {
  const raw = String(value ?? '').trim();
  if (!raw) return `${label} is required.`;
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return `${label} must be a number.`;
  if (amount <= min) return `${label} must be greater than ${min}.`;
  if (integer && !Number.isInteger(amount)) return `${label} must be a whole number.`;
  if (max !== undefined && amount > max) return `${label} cannot be more than ${max}.`;
  return '';
};

export const validateFutureDate = (value, label = 'Date') => {
  const raw = String(value ?? '').trim();
  if (!raw) return `${label} is required.`;
  const parsed = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return `Enter a valid ${label.toLowerCase()}.`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) return `${label} cannot be in the past.`;
  return '';
};

/** First key in `order` that has an error, or null. Used to focus the field. */
export const firstInvalidField = (errors, order) =>
  order.find(key => Boolean(errors[key])) || null;

export const countErrors = errors => Object.values(errors).filter(Boolean).length;

export default FormField;
