/**
 * Google Cloud client options.
 *
 * The old code hardcoded `keyFilename: 'google-credentials.json'` and
 * `keyFilename: 'key.json'` — two copies of a service-account private key that
 * were committed to a public repository. Credentials now come from the
 * environment: a file path for local development, or the raw JSON for hosts
 * that inject secrets as env vars (Render, Railway, Fly, Heroku, Cloud Run).
 */

const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

const clientOptions = () => {
  if (env.googleCloud.credentialsJson) {
    let parsed;
    try {
      parsed = JSON.parse(env.googleCloud.credentialsJson);
    } catch (error) {
      throw new AppError('GOOGLE_CREDENTIALS_JSON is not valid JSON', 500);
    }

    return {
      projectId: parsed.project_id,
      credentials: {
        client_email: parsed.client_email,
        private_key: parsed.private_key,
      },
    };
  }

  if (env.googleCloud.keyFile) {
    // The Google SDKs also read GOOGLE_APPLICATION_CREDENTIALS implicitly, but
    // being explicit keeps the failure mode obvious.
    return { keyFilename: env.googleCloud.keyFile };
  }

  throw new AppError('Speech services are not configured on this server', 503);
};

const assertConfigured = () => {
  if (!env.googleCloud.configured) {
    throw new AppError('Speech services are not configured on this server', 503);
  }
};

module.exports = { clientOptions, assertConfigured };
