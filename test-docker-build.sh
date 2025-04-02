#!/bin/bash

# Debug script for testing Docker build and deployment
# This script builds and runs the Docker container locally,
# allowing you to test the exact configuration used in production

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down

# Build the production Docker image
echo "Building Docker image with current Dockerfile..."
docker build -t portfolio-debug .

# Run the container with same environment as CI/CD
echo "Running container for testing..."
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DOCKER_CONTAINER=true \
  -e PORT=3001 \
  -e OPENAI_API_KEY=${OPENAI_API_KEY} \
  --name portfolio-debug-container \
  portfolio-debug

# Notes:
# - The container will run in the foreground, press Ctrl+C to stop
# - Access the site at http://localhost:3001
# - Check the logs for any errors or path resolution issues
