# Portfolio Application Startup Guide

This guide explains how to start the portfolio application and avoid common issues like port conflicts and CORS errors.

## 🔄 Current Configuration

The application architecture uses the following configuration:

1. **Port Configuration**:
   - Backend Express API: Port `3000` (main application port)
   - Frontend Vite Dev Server: Port `5173` (development only)

2. **Enhanced CORS Configuration**:
   - Explicitly allows frontend origins in development
   - More secure configuration for production
   - Prevents cross-origin issues between frontend and backend

3. **Added Smart Startup Script**: 
   - Detects port conflicts automatically
   - Offers to resolve conflicts by closing blocking processes
   - Handles startup errors gracefully

4. **Updated Docker Configuration**:
   - Docker ports aligned with new configuration
   - More consistent between dev and production environments

## 🚀 Starting the Application

### Recommended Method (Handles Port Conflicts)

```bash
npm run start:safe
```

This command:
- Checks if ports 3000 and 3001 are available
- Offers to kill conflicting processes if found
- Starts the application with proper error handling

### Traditional Method

```bash
npm run dev
```

This still works but doesn't handle port conflicts automatically.

## ⚙️ Configuration Details

The application now runs with:

- **Backend API Server**: 
  - Port: 3000
  - Serves API endpoints and static assets
  - Improved CORS to accept requests from Vite dev server

- **Frontend Development Server**: 
  - Port: 5173 (Vite default)
  - Proxies API requests to Backend (localhost:3000)
  - Development-only server for hot reloading

## 🛠️ Troubleshooting

### Port Conflicts

If you see an error like `EADDRINUSE: address already in use :::3000` or `:::3001`:

1. Use the safe starter: `npm run start:safe`
2. Or manually find and kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /F /PID <PID>
   
   # macOS/Linux
   lsof -i :3000
   kill -9 <PID>
   ```

### CORS Errors

If you see CORS errors in the browser console:

1. Ensure the backend is running on port 3000
2. Check that frontend is making requests to the correct URL (/api/* should be proxied to the backend)
3. Restart both servers if the issue persists

## 🐳 Docker Usage

The Docker configuration has been updated to match the new port settings:

```bash
# Run in production mode
npm run docker:prod

# Run in development mode
npm run docker:dev
