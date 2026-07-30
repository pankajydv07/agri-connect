import React from 'react';
import PropTypes from 'prop-types';

/**
 * Money formatting for AgriConnect.
 *
 * Every price on this platform is in Indian rupees, so formatting is locked to
 * the en-IN locale (which also gives the correct lakh/crore digit grouping,
 * e.g. ₹1,25,000.00 rather than ₹125,000.00).
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatINR = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return inrFormatter.format(amount);
};

const Money = ({ value, perUnit, className }) => (
  <span className={className}>
    {formatINR(value)}
    {perUnit ? ` / ${perUnit}` : ''}
  </span>
);

Money.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** e.g. "kg" renders "₹40.00 / kg" */
  perUnit: PropTypes.string,
  className: PropTypes.string
};

Money.defaultProps = {
  value: 0,
  perUnit: '',
  className: ''
};

export default Money;
