# Docker Setup Guide for Portfolio Application

This guide explains how to work with the Docker setup for the portfolio application.

## Environment Configuration

Before running the application with Docker, make sure you have a proper `.env` file with:

```
PORT=3000
NODE_ENV=development
DOCKER_CONTAINER=false  # This will be overridden by Docker
OPENAI_API_KEY=your_api_key_here
```

## Docker Configurations

The project has two main Docker configurations:

### 1. Development Environment (Dockerfile.dev)

- Uses Node.js 18
- Hot-reloading enabled with volume mounts
- Exposes port 3000

**Usage:**
```bash
# Run development environment
npm run docker:dev
# or
docker-compose up dev
```

### 2. Production Environment (Dockerfile)

- Multi-stage build process
- Optimized for production
- Secure configuration with non-root user
- Health checks enabled
- Exposes port 3000

**Usage:**
```bash
# Run production environment
npm run docker:prod
# or
docker-compose up app
```

## Architecture Overview

- **Backend**: Express server running on port 3000
- **Frontend**: 
  - In development: Vite dev server on port 5173
  - In production: Static files served by Express

## Scripts

The following npm scripts are available to work with Docker:

- `npm run docker:build`: Build the Docker image
- `npm run docker:run`: Run the Docker container
- `npm run docker:dev`: Run development environment with Docker Compose
- `npm run docker:prod`: Run production environment with Docker Compose

## Port Configuration

All Docker configurations use port 3000 to match the local development environment.

## CI/CD Integration

The repository includes CI/CD pipeline files for GitHub Actions, which handle:
- Building and testing the Docker image
- Pushing the image to a container registry
- Deploying to production

## Platform Compatibility

This project's Docker configuration is set up to handle cross-platform compatibility:

- **Apple Silicon (M1/M2) Macs**: The Docker configuration uses `--platform=linux/amd64` to ensure compatibility with Node.js dependencies that may not have native ARM64 support.
- **Intel-based systems**: The platform specification ensures consistent builds across different architectures.

By specifying the platform in both Dockerfiles and docker-compose.yml, we avoid issues with architecture-specific dependencies like Rollup, which may otherwise cause errors related to missing modules (e.g., `@rollup/rollup-linux-arm64-gnu`).

## Troubleshooting

If you encounter issues with Docker:

1. Ensure ports are not already in use (especially 3000 and 5173)
2. Check logs with `docker-compose logs`
3. Verify environment variables are correctly passed
4. Make sure the `.env` file is properly configured

### Apple Silicon (M1/M2/M3) Specific Issues

If running on Apple Silicon and encountering architecture-related errors:

1. Ensure all Docker files have the `--platform=linux/amd64` flag 
2. For dependency errors mentioning "cannot find module", this is typically related to architecture mismatch
3. Try rebuilding the Docker images with `docker-compose build --no-cache` after updating platform settings
4. Check that Docker Desktop has Rosetta enabled (Settings → Features in development → Use Rosetta for x86/amd64 emulation on Apple Silicon)

For database or OpenAI API related issues, check your API keys and connection settings.
