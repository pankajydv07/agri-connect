/**
 * Express application.
 *
 * Split out from `server.js` so tests can mount the app with supertest without
 * opening a port or connecting to a real database.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const pinoHttp = require('pino-http');
const mongoose = require('mongoose');

const env = require('./config/env');
const logger = require('./config/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { AUDIO_DIR } = require('./controllers/speech');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const cropRoutes = require('./routes/cropRoutes');
const aiRoutes = require('./routes/ai');
const speechRoutes = require('./routes/speech');

const app = express();

// Behind a load balancer or PaaS router, trust the proxy so req.ip is the real
// client address — otherwise every rate limit key collapses to the proxy's IP.
if (env.isProduction) {
  app.set('trust proxy', 1);
}

// Security headers — helmet was not installed at all previously, so the app
// shipped no CSP, no HSTS, no X-Content-Type-Options.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/**
 * CORS is driven by config instead of the hardcoded `http://localhost:3000`
 * that would have rejected every request in production.
 */
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/server-to-server requests send no Origin header.
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(compression());

// A body limit: without one, a single large POST can exhaust server memory.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Strips `$`-prefixed and dotted keys, closing off operator injection through
// request bodies and query strings.
app.use(mongoSanitize());

if (!env.isTest) {
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
}

/**
 * Health check for load balancers and container orchestrators. There was no way
 * to probe liveness without issuing a real API call.
 */
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    uptime: process.uptime(),
    database: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Generated TTS audio. Served from a temp directory, not from the repo.
app.use(
  '/media/audio',
  express.static(AUDIO_DIR, { maxAge: '1h', fallthrough: true, index: false })
);

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/speech', speechRoutes);
// Kept at its original path so the existing client keeps working.
app.use('/api/speak', speechRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
