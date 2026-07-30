import axios from 'axios';

/**
 * Single source of truth for the backend origin.
 *
 * Configure via `REACT_APP_API_URL` (see client/.env.example). CRA inlines
 * `process.env.REACT_APP_*` at build time, so this must be a public value —
 * never put a secret in a REACT_APP_* variable.
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const TOKEN_STORAGE_KEY = 'token';

/**
 * Resolve a server-returned path (e.g. the `file` field from /api/speak) into
 * an absolute URL the browser can load.
 */
export const resolveApiUrl = (path) => {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// On 401, drop the dead token and bounce the user to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // Only treat a 401 as an expired session if we actually sent a token.
    // Anonymous 401s (e.g. bootstrap /api/auth/me, a bad password on the login
    // form) must not hard-navigate the user.
    const hadToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
    const requestUrl = error?.config?.url || '';
    const isAuthAttempt = /\/api\/auth\/(login|register)$/.test(requestUrl);

    if (status === 401 && hadToken && !isAuthAttempt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      delete api.defaults.headers.common.Authorization;

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
