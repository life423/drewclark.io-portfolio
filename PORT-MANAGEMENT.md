# Port Management for Portfolio Application

This guide explains how to run the application while avoiding port conflicts.

## Starting the Application

- **Development Mode**:
  ```
  npm run dev
  ```
  This starts the application with automatic port conflict detection and cleanup. It will automatically kill any processes using ports 3000 or 5173.

## Additional Commands

- **Manual Port Cleanup**:
  ```
  npm run kill-ports
  ```
  This manually kills any processes using ports 3000 or 5173 without starting the application.

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

- **Backend**: Port 3000 (configurable via .env PORT variable)
- **Frontend**: Port 5173 (Vite's default port)

## API Connectivity

The frontend makes API calls to the backend through the following endpoints:
- Connect4 AI: `/api/askGPT/connect4`
- Project information: `/api/askGPT/projects`

Vite is configured to proxy these requests to the backend when running in development mode.

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
