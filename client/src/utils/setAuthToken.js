import api, { TOKEN_STORAGE_KEY } from './api';

/**
 * Keep the shared axios instance in sync with the current JWT.
 *
 * The request interceptor in `utils/api.js` already reads the token from
 * localStorage on every call, so this is belt-and-braces for code paths that
 * set a token and immediately fire a request.
 */
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export default setAuthToken;
