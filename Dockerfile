# ---------------------------------------------------------------------------
# Stage 1 — Build the React client
# ---------------------------------------------------------------------------
FROM node:20-alpine AS client-builder

WORKDIR /build

# Accept the CRA build-time variable. CRA inlines REACT_APP_* at build time,
# so it must arrive as a Docker build ARG, not a runtime env var.
ARG REACT_APP_API_URL

COPY client/package.json client/package-lock.json ./client/

RUN npm ci --prefix client

COPY client/ ./client/

RUN npm run build --prefix client

# ---------------------------------------------------------------------------
# Stage 2 — Production server
# ---------------------------------------------------------------------------
FROM node:20-alpine AS production

# dumb-init: PID 1 in a container does not receive SIGTERM by default.
# dumb-init forwards signals to the Node process so graceful shutdown works.
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /app

# Install server production deps only (no devDependencies).
COPY server/package.json server/package-lock.json ./

RUN npm ci --omit=dev

# Copy server source.
COPY server/ ./

# Copy the built client so Express can serve it as static files if desired,
# and so the path is predictable for any future static-serving middleware.
COPY --from=client-builder /build/client/build ./client/build

# Run as a non-root user. The node image ships a built-in "node" user (uid 1000).
USER node

EXPOSE 5000

# Healthcheck — mirrors the GET /health endpoint in app.js.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# dumb-init is the init process; it forwards SIGTERM to npm/node.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
