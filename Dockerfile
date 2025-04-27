# ─── Stage 1: Install, patch & build dependencies ───────────────────
FROM node:18-alpine AS builder

# Accept build arguments for environment variables
ARG VITE_API_URL="/api/askGPT"
ENV VITE_API_URL=${VITE_API_URL}

# system tools only needed at build time
RUN apk add --no-cache git openssh python3 make g++

WORKDIR /app

# copy manifests
COPY package*.json ./
COPY api/package*.json api/
COPY app/package*.json app/

# Copy scripts first so postinstall can find them
COPY scripts/ scripts/

# patch Windows permissions script before running npm install
RUN sed -i 's/const { spawn } = require(.child_process.);/const { spawn } = require("child_process");\
\n\/\/ Skip PowerShell in Docker\nfunction setWindowsPermissions() { return Promise.resolve(true); }/' \
  scripts/permissions.js

# install root + api + app deps (incl. devDeps)
RUN npm install --legacy-peer-deps \
  && cd api && npm install --legacy-peer-deps \
  && cd ../app && npm install --legacy-peer-deps

# copy source & build frontend
COPY . .
# Add verbose logging and provide a default value to ensure build doesn't fail if env var is empty
RUN echo "Building with VITE_API_URL=${VITE_API_URL:-/api/askGPT}" && \
    cd app && VITE_API_URL=${VITE_API_URL:-/api/askGPT} npm run build

# ─── Stage 2: Create minimal prod image ───────────────────────────
FROM node:18-alpine AS runner
LABEL maintainer="drew@drewclark.io"

WORKDIR /app

# Copy scripts first so postinstall can find them
COPY --from=builder /app/scripts      scripts

# install runtime deps
COPY package*.json ./
COPY api/package*.json api/
RUN npm install --production --legacy-peer-deps && \
    npm install uuid --legacy-peer-deps

# bring in built frontend & server code
COPY --from=builder /app/app/dist     app/dist
COPY --from=builder /app/api          api
COPY --from=builder /app/server.js    server.js

# create runtime dirs
RUN mkdir -p data/embeddings data/repositories data/contact

EXPOSE 3000
CMD ["node", "server.js"]
