# Port Management for Portfolio Application

This guide explains how to run the application while avoiding port conflicts.

## Recommended Startup Method

- **Automatic Development Mode**:
  ```
  npm run dev:safe
  ```
  This starts the application with automatic port conflict detection and cleanup. It will automatically kill any processes using ports 3001 or 5173.

## Other Available Commands

- **Standard Development Mode**:
  ```
  npm run dev
  ```
  This starts the application without any port conflict detection. Use this only if you're sure the required ports are available.

- **Manual Port Cleanup**:
  ```
  npm run kill-ports
  ```
  This manually kills any processes using ports 3001 or 5173 without starting the application.

## Docker Commands

- **Run Development Environment**:
  ```
  npm run docker:dev
  ```
  This starts the application in development mode inside Docker containers.

- **Run Production Environment**:
  ```
  npm run docker:prod
  ```
  This starts the application in production mode inside Docker containers.

## Port Configuration

The application uses the following ports:

- **Backend**: Port 3001 (configurable via .env PORT variable)
- **Frontend**: Port 5173 (Vite's default port)

## Environment Variables

Port configuration can be customized using environment variables in the `.env` file:

1. Copy `.env.template` to `.env` if you haven't already
2. Set the `PORT` variable to change the backend port
3. Remember to update both local and Docker environments to match

## Troubleshooting

If you encounter EADDRINUSE errors:

1. Use `npm run dev:safe` which automatically handles port conflicts
2. Alternatively, run `npm run kill-ports` to free the required ports
3. Check if Docker containers are running with `docker ps`
4. If Docker is using the ports, stop containers with `docker-compose down`
