# Build stage for frontend
FROM node:18-alpine AS build-frontend
WORKDIR /app

# Add metadata labels
LABEL maintainer="Drew Clark <contact@drewclark.io>"
LABEL description="Portfolio website for Drew Clark"
LABEL version="1.0.0"

# Install dependencies - leverage cache layers
COPY app/package*.json ./
RUN if [ -f ./package-lock.json ]; then npm ci --no-audit --no-fund --legacy-peer-deps; else npm install --no-audit --no-fund --legacy-peer-deps; fi

# Copy source files and build
COPY app/ ./
RUN npm run build

# Backend dependencies stage - separate to optimize caching
FROM node:18-alpine AS build-backend
WORKDIR /app

# Copy start-app.js FIRST to avoid the error in postinstall script
COPY start-app.js ./

# Install backend dependencies
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund --legacy-peer-deps --production; else npm install --no-audit --no-fund --legacy-peer-deps --production; fi

# Final production image (smaller)
FROM node:18-alpine AS production
WORKDIR /app

# Add metadata labels
LABEL maintainer="Drew Clark <contact@drewclark.io>"
LABEL description="Portfolio website for Drew Clark"
LABEL version="1.0.0"

# Set environment variables
ENV NODE_ENV=production
ENV DOCKER_CONTAINER=true
ENV PORT=3001

# Create and use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only the necessary files
COPY --from=build-backend /app/node_modules ./node_modules
COPY --from=build-frontend /app/dist ./app/dist
COPY server.js ./
COPY api/ ./api/
COPY start-app.js ./

# Set proper permissions
USER root
RUN if [ -f ./start-app.js ]; then chmod +x ./start-app.js; fi && chown -R appuser:appgroup /app
USER appuser

# Set up healthcheck - checks server response every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:$PORT/api || exit 1

# Expose port
EXPOSE 3001

# Use proper entrypoint script for signal handling
ENTRYPOINT ["node", "server.js"]
