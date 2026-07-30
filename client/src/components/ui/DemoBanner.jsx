import React from 'react';
import PropTypes from 'prop-types';

/**
 * Honesty banner for features that are still demos.
 *
 * Deliberately NOT dismissible: any screen that shows fabricated output has to
 * keep saying so for as long as that output is on screen. If you are tempted to
 * add a close button, wire the feature to its real backend instead.
 *
 * Meaning is not carried by colour alone — there is an icon, an explicit
 * "DEMO" tag and plain-language body text, and the banner is exposed to
 * assistive tech via role="alert".
 */
const TONES = {
  critical: {
    wrapper: 'border-red-600 bg-red-50',
    tag: 'bg-red-700 text-white',
    title: 'text-red-900',
    body: 'text-red-900',
    icon: 'text-red-700',
    marker: 'bg-red-700'
  },
  warning: {
    wrapper: 'border-amber-500 bg-amber-50',
    tag: 'bg-amber-700 text-white',
    title: 'text-amber-900',
    body: 'text-amber-900',
    icon: 'text-amber-700',
    marker: 'bg-amber-700'
  }
};

const DemoBanner = ({ tone, tag, title, children, points, className }) => {
  const styles = TONES[tone] || TONES.warning;

  return (
    <div
      role="alert"
      className={`mb-6 rounded-lg border-2 border-l-8 p-4 shadow-sm sm:p-5 ${styles.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          className={`mt-0.5 h-7 w-7 flex-shrink-0 ${styles.icon}`}
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
        <div className="min-w-0">
          <p>
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-extrabold uppercase tracking-widest ${styles.tag}`}
            >
              {tag}
            </span>
          </p>
          <h2 className={`mt-2 text-lg font-bold sm:text-xl ${styles.title}`}>{title}</h2>
          {children ? <div className={`mt-2 space-y-2 text-sm sm:text-base ${styles.body}`}>{children}</div> : null}
          {points && points.length > 0 ? (
            <ul className={`mt-3 space-y-1.5 text-sm ${styles.body}`}>
              {points.map(point => (
                <li key={point} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${styles.marker}`}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
};

DemoBanner.propTypes = {
  tone: PropTypes.oneOf(['critical', 'warning']),
  tag: PropTypes.string,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  points: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

DemoBanner.defaultProps = {
  tone: 'warning',
  tag: 'Demo — not real data',
  children: null,
  points: [],
  className: ''
};

export default DemoBanner;
