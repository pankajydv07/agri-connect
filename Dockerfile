# Multi-stage build for Node.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build application (if build script exists)
RUN npm run build 2>/dev/null || echo "No build script, skipping"

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy node_modules from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy app source and built assets
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist 2>/dev/null || true
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node healthcheck.js || exit 1

# Start application
CMD ["npm", "start"]
