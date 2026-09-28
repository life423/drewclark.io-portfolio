# ─── Stage 1: Install, patch & build dependencies ───────────────────
FROM node:20-alpine AS builder

# Accept build arguments for environment variables
ARG VITE_API_URL="/api/askGPT"
ENV VITE_API_URL=${VITE_API_URL}

# system tools only needed at build time
RUN apk add --no-cache git openssh python3 make g++

WORKDIR /app

# copy manifests
COPY app/package*.json app/

# install the frontend's deps (incl. devDeps) to build it
RUN cd app && npm install --legacy-peer-deps

# copy source & build frontend
COPY . .
# Add verbose logging and provide a default value to ensure build doesn't fail if env var is empty
RUN echo "Building with VITE_API_URL=${VITE_API_URL:-/api/askGPT}" && \
    cd app && VITE_API_URL=${VITE_API_URL:-/api/askGPT} npm run build

# ─── Stage 2: Create minimal prod image ───────────────────────────
FROM node:20-alpine AS runner
LABEL maintainer="drew@drewclark.io"
ENV NODE_ENV=production

# Secrets like OPENAI_API_KEY are injected at runtime (Container Apps secret, docker run -e). Never ARG/ENV them.

WORKDIR /app

# install runtime deps
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# bring in built frontend & server code
COPY --from=builder /app/app/dist     app/dist
COPY --from=builder /app/api          api
COPY --from=builder /app/server.js    server.js
COPY --from=builder /app/app/src/data/projects.json app/src/data/projects.json

# the contact form's fallback file lives in data/; then drop root
RUN mkdir -p data/contact && chown -R node:node data
USER node

EXPOSE 3000
CMD ["node", "server.js"]
