# Development Startup Guide

This guide explains how to use the new cross-platform development environment for the Drew Clark Portfolio application.

## Overview

The development environment has been completely redesigned for cross-platform compatibility and reliability:

1. **Modular Architecture** - Separate scripts for each component with independent error handling
2. **Cross-Platform Compatibility** - Works seamlessly on Windows, macOS, and Linux
3. **Robust Process Management** - Multiple fallback methods for starting services
4. **Smart Error Recovery** - Automatic retry logic and detailed diagnostics
5. **Unified Logging** - Color-coded, consistent logging across all components

## Getting Started

To start the development environment with all services:

```bash
npm run dev
```

This single command will:
- Check if Docker is running and start Qdrant if needed
- Kill any processes using ports 3000 (API) or 5173 (frontend)
- Start the API server with auto-reloading using the most reliable method for your platform
- Start the frontend Vite development server
- Provide unified color-coded logs

## Startup Options

We've added several specialized npm scripts for development flexibility:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start everything (API, frontend, Docker containers) |
| `npm run dev:no-docker` | Start API and frontend without Docker dependencies |
| `npm run dev:api` | Start only the API server |
| `npm run dev:frontend` | Start only the frontend server |
| `npm run dev:qdrant` | Only ensure Qdrant is running and configured |
| `npm run fix:qdrant-ids` | Fix Qdrant ID format issues in vectorDb service |
| `npm run dev:legacy` | Use the old startup method (for compatibility) |

For detailed help on available options:

```bash
node scripts/dev.js --help
```

## Architecture

The development environment is now built on a modular architecture:

1. **`scripts/utils.js`** - Cross-platform utilities for process management and HTTP requests
2. **`scripts/ensure-qdrant.js`** - Ensures Qdrant vector database is running and healthy
3. **`scripts/start-api-server.js`** - Starts the API server with multiple fallback methods
4. **`scripts/start-frontend.js`** - Starts the frontend server with platform-specific handling
5. **`scripts/dev.js`** - Orchestrates the entire environment
6. **`scripts/fix-qdrant-ids.js`** - Fixes vector ID format issues in the Qdrant service

## Docker Integration

The script automatically manages Docker containers with better error handling:

1. Checks Docker installation status with detailed feedback
2. Probes multiple health endpoints to confirm container readiness
3. Sets proper timeouts to prevent hanging
4. Automatically creates required collections with correct schema

If Docker is not available, the system will fall back to mock implementations where possible.

## Troubleshooting

### Cross-Platform Issues

If you encounter platform-specific problems:

1. For Windows process errors:
   - Try running with Administrator privileges
   - Check that no antivirus is blocking process creation
   - Verify PowerShell execution policy with `Get-ExecutionPolicy`

2. For Docker connection issues:
   - Ensure Docker Desktop is running
   - Try `docker-compose -f docker-compose-qdrant.yml restart`
   - Check Docker logs with `docker logs qdrant`

### Qdrant Vector ID Errors

If you see errors like `"not a valid point ID, valid values are either an unsigned integer or a UUID"`:

1. Run `npm run fix:qdrant-ids` to update ID formats
2. Restart the API server with `npm run dev:api`
3. If problems persist, delete Qdrant volumes and restart: 
   ```
   docker-compose -f docker-compose-qdrant.yml down -v
   npm run dev:qdrant
   ```

### API Server Issues

If the API won't start:

1. Check for nodemon issues with `npx nodemon --version`
2. Try the direct Node.js approach: `node server.js`
3. Look for port conflicts: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Unix)

## Verifying the Environment

To verify each component:

1. **API Server**: Visit http://localhost:3000/api/health
2. **Frontend**: Open http://localhost:5173
3. **Qdrant**: Check http://localhost:6333/collections

For more details on the repository integration system, see `REPOSITORY-INTEGRATION-GUIDE.md`.
