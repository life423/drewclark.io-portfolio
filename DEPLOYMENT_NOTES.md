# Deployment Changes Documentation

## Issue Summary

The portfolio application was experiencing two main issues:

1. **Asset Loading Errors**: JS, CSS, images, and favicon files were failing to load with `net::ERR_CONNECTION_REFUSED` errors in the browser, even though the Express server was correctly serving /index.html.
   
2. **Qdrant Connection Issues**: The Node.js application couldn't connect to the Qdrant vector database using the container hostname, causing embedding operations to fail.

## Changes Made

### 1. Fixed Asset Path Resolution

- Changed Vite's `base` configuration from relative (`./`) to absolute (`/`) paths.
- This ensures all assets are requested from the correct root path.
- Previously, assets were requested relative to the current URL, which could cause issues in containerized environments.

### 2. Enhanced Qdrant Vector Database Connection

- Added multiple fallback URLs when hostname resolution fails:
  - Primary: `http://qdrant:6333` (Docker service name)
  - Fallback 1: `http://localhost:6333` (For local connections)
  - Fallback 2: `http://127.0.0.1:6333` (Direct IP fallback)
- Improved error handling with graceful degradation in production:
  - Service falls back to mock implementation if all connection attempts fail
  - Prevents application crashes when Qdrant is temporarily unavailable

### 3. Enhanced Docker Network Configuration

- Added explicit network definitions for both development and production environments
- Set DNS fallback to Google's `8.8.8.8` to improve hostname resolution
- Added container healthchecks to detect and recover from failures
- Changed port mapping to use standard HTTP port 80 in production

## Deployment Instructions

1. Pull the latest changes: `git pull origin main`
2. Rebuild the Docker image: `docker build -t aiandrew631/portfolio:latest .`
3. Push the updated image: `docker push aiandrew631/portfolio:latest`
4. On the droplet, ensure the containers are using a shared network:
   ```bash
   docker network create portfolio_network
   ```
5. Deploy with the updated configuration:
   ```bash
   docker pull aiandrew631/portfolio:latest
   docker rm -f portfolio
   docker run -d --name portfolio --restart unless-stopped -p 80:3000 \
     --network portfolio_network \
     -e OPENAI_API_KEY=<your-key> \
     -e DOCKER_CONTAINER=true \
     aiandrew631/portfolio:latest
   ```
6. Ensure Qdrant is running on the same network:
   ```bash
   docker run -d --name qdrant --restart unless-stopped \
     --network portfolio_network \
     -p 6333:6333 -p 6334:6334 \
     -v qdrant_data:/qdrant/storage \
     -e QDRANT_ALLOW_CORS=true \
     qdrant/qdrant:latest
   ```

## Troubleshooting

If asset loading issues persist:

1. Check the browser console for specific errors
2. Verify that the server's port (80) is accessible from outside
3. Inspect the built HTML file to ensure assets use absolute paths:
   ```bash
   docker exec portfolio cat /app/app/dist/index.html | grep -E "script|link"
   ```

If Qdrant connection issues persist:

1. Check connectivity between containers:
   ```bash
   docker exec portfolio curl -I http://qdrant:6333/healthz
   ```
2. Verify DNS resolution:
   ```bash
   docker exec portfolio nslookup qdrant
   ```
3. Check if the QdrantService is falling back to mock mode in logs:
   ```bash
   docker logs portfolio | grep -E "Qdrant|mock"
