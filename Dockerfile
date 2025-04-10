FROM node:18-alpine

# Install git and build essentials
RUN apk add --no-cache git openssh python3 make g++

# Create app directory
WORKDIR /app

# Copy the scripts directory first to ensure permissions.js is available
COPY scripts/ ./scripts/

# Copy package files
COPY package*.json ./
COPY api/package*.json ./api/
COPY app/package*.json ./app/

# Modify permissions.js for Docker compatibility
RUN sed -i 's/const { spawn } = require(.child_process.);/const { spawn } = require("child_process");\n\n\/\/ Skip PowerShell in Docker\nfunction setWindowsPermissions() { return Promise.resolve(true); }/' ./scripts/permissions.js

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd api && npm install
RUN cd app && npm install --legacy-peer-deps

# Copy all remaining source files
COPY . .

# Build the frontend
RUN cd app && npm run build

# Create required data directories
RUN mkdir -p data/embeddings data/repositories data/contact

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "start-app.js"]
