# Build stage for frontend
FROM node:18-alpine AS build-frontend
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app/ ./
RUN npm run build

# Final production image
FROM node:18-alpine
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy server.js and API code
COPY server.js ./
COPY api/ ./api/

# Copy built frontend assets
COPY --from=build-frontend /app/dist ./app/dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Command to run
CMD ["node", "server.js"]
