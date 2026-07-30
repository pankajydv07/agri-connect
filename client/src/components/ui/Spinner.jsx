import React from 'react';
import PropTypes from 'prop-types';

/**
 * Shared loading indicator.
 *
 * Keeps the visual language already used across the app (a green/blue ring
 * built from top + bottom borders) but adds the accessibility plumbing that
 * was missing: a `role="status"` wrapper and a screen-reader-only label, so
 * "something is happening" is announced instead of being conveyed by
 * animation alone.
 */
const SIZES = {
  sm: 'h-4 w-4 border-t-2 border-b-2',
  md: 'h-8 w-8 border-t-2 border-b-2',
  lg: 'h-12 w-12 border-t-4 border-b-4',
  xl: 'h-16 w-16 border-t-4 border-b-4'
};

const TONES = {
  green: 'border-green-500',
  blue: 'border-blue-500',
  gray: 'border-gray-400',
  white: 'border-white'
};

const Spinner = ({ size, tone, label, className }) => (
  <span role="status" className={`inline-flex items-center ${className}`}>
    <span
      aria-hidden="true"
      className={`animate-spin rounded-full ${SIZES[size] || SIZES.md} ${TONES[tone] || TONES.green}`}
    />
    {label ? <span className="sr-only">{label}</span> : null}
  </span>
);

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  tone: PropTypes.oneOf(['green', 'blue', 'gray', 'white']),
  /** Screen-reader text. Pass null when a visible label sits next to it. */
  label: PropTypes.string,
  className: PropTypes.string
};

Spinner.defaultProps = {
  size: 'md',
  tone: 'green',
  label: 'Loading',
  className: ''
};

/**
 * Centred block used while a list/section is fetching. Shows a visible label
 * as well as the spinner — on a slow 2G connection an unlabelled spinner
 * gives no clue whether anything is actually happening.
 */
export const SpinnerBlock = ({ label, size, tone, className }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex flex-col items-center justify-center py-12 ${className}`}
  >
    <Spinner size={size} tone={tone} label={null} />
    <p className="mt-3 text-sm text-gray-600">{label}</p>
  </div>
);

SpinnerBlock.propTypes = {
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  tone: PropTypes.oneOf(['green', 'blue', 'gray', 'white']),
  className: PropTypes.string
};

SpinnerBlock.defaultProps = {
  label: 'Loading…',
  size: 'lg',
  tone: 'green',
  className: ''
};

export default Spinner;
