# Port Management for Portfolio Application

This guide explains how to run the application while avoiding port conflicts.

## Available Commands

The application provides several ways to start the development server:

- **Standard Development Mode**:
  ```
  npm run dev
  ```
  This starts the application without any port conflict detection.

- **Safe Development Mode**:
  ```
  npm run dev:safe
  ```
  This starts the application with automatic port conflict detection and cleanup. It will automatically kill any processes using ports 3000 or 3001.

- **Interactive Development Mode**:
  ```
  npm run start:safe
  ```
  This starts the application with interactive port conflict detection. It will prompt you before killing any conflicting processes.

- **Manual Port Cleanup**:
  ```
  npm run kill-ports
  ```
  This manually kills any processes using ports 3000 or 3001 without starting the application.

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

- **Frontend**: Port 3000 (local development) or 3001 (when accessing through backend)
- **Backend**: Port 3001

## Environment Variables

Port configuration can be customized using environment variables in the `.env` file:

1. Copy `.env.template` to `.env` if you haven't already
2. Set the `PORT` variable to change the backend port
3. Remember to update both local and Docker environments to match

## Troubleshooting

If you encounter EADDRINUSE errors:

1. Run `npm run kill-ports` to free the required ports
2. Check if Docker containers are running with `docker ps`
3. If Docker is using the ports, stop containers with `docker-compose down`
4. Try using `npm run dev:safe` which automatically handles port conflicts
