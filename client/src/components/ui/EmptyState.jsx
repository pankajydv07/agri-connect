import React from 'react';
import PropTypes from 'prop-types';

/**
 * Shared empty / error placeholder for lists and sections.
 *
 * Two variants:
 *  - "empty": nothing to show yet. Should always offer a next action.
 *  - "error": the fetch failed. Always offers a retry, because rural users on
 *    2G connections hit failed requests constantly and a blank list gives them
 *    no way to recover other than reloading the whole app.
 *
 * Meaning is never carried by colour alone: each variant has an icon and
 * explicit text.
 */

/** Apply to a <Link>/<button> passed in via the `action` prop for a consistent CTA. */
export const emptyStateActionClass =
  'inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';

export const emptyStateSecondaryActionClass =
  'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';

const EmptyIcon = () => (
  <svg
    aria-hidden="true"
    className="h-10 w-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.6a1 1 0 00-.95.68l-.35 1.05a1 1 0 01-.95.68h-4.3a1 1 0 01-.95-.68l-.35-1.05A1 1 0 007.6 13H4"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    aria-hidden="true"
    className="h-10 w-10 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"
    />
  </svg>
);

const EmptyState = ({
  variant,
  title,
  description,
  detail,
  icon,
  action,
  secondaryAction,
  onRetry,
  retryLabel,
  className
}) => {
  const isError = variant === 'error';

  return (
    <div
      {...(isError ? { role: 'alert' } : {})}
      className={`rounded-lg border p-8 text-center ${
        isError ? 'border-red-200 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'
      } ${className}`}
    >
      <div className="flex justify-center">{icon || (isError ? <ErrorIcon /> : <EmptyIcon />)}</div>
      <h3 className={`mt-3 text-lg font-semibold ${isError ? 'text-red-800' : 'text-gray-800'}`}>
        {isError && (
          <span className="mr-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            Error
          </span>
        )}
        {title}
      </h3>
      {description ? (
        <p className={`mt-2 text-sm ${isError ? 'text-red-800' : 'text-gray-600'}`}>{description}</p>
      ) : null}
      {detail ? <p className="mt-1 text-xs text-gray-500">{detail}</p> : null}
      {(action || secondaryAction || onRetry) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button type="button" onClick={onRetry} className={emptyStateActionClass}>
              <svg
                aria-hidden="true"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h5m11 11v-5h-5m4.6-6A8 8 0 006.3 6.3M3.4 14a8 8 0 0013.3 3.7"
                />
              </svg>
              {retryLabel}
            </button>
          ) : null}
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  variant: PropTypes.oneOf(['empty', 'error']),
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  /** Small print, e.g. the server's error message. */
  detail: PropTypes.node,
  icon: PropTypes.node,
  /** Primary next action, usually a <Link> or <button>. */
  action: PropTypes.node,
  secondaryAction: PropTypes.node,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  className: PropTypes.string
};

EmptyState.defaultProps = {
  variant: 'empty',
  description: '',
  detail: '',
  icon: null,
  action: null,
  secondaryAction: null,
  onRetry: undefined,
  retryLabel: 'Try again',
  className: ''
};

/** Convenience wrapper for failed fetches. */
export const ErrorState = ({ title, description, ...rest }) => (
  <EmptyState variant="error" title={title} description={description} {...rest} />
);

ErrorState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.node
};

ErrorState.defaultProps = {
  title: 'We could not load this',
  description:
    'The request did not go through. Check your internet connection and try again — nothing you entered has been lost.'
};

export default EmptyState;
