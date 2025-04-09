# Repository Integration Guide

This guide explains how to use and maintain the enhanced code repository integration system that allows the AI to access and understand GitHub repository code.

## Setup Guide

### 1. Install and Run Qdrant Vector Database

The system uses Qdrant for storing code embeddings. To start Qdrant:

```bash
# Start the Qdrant container
docker-compose -f docker-compose-qdrant.yml up -d
```

Verify it's running:
```bash
curl http://localhost:6333/healthz
```

### 2. Configure Repository Processing

The following environment variables control repository processing:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_REPOSITORY_SCHEDULER` | Enable automatic processing | `true` |
| `REPOSITORY_PROCESS_TIMEOUT_MS` | Max processing time per repo | `1800000` (30 min) |
| `REPOSITORY_CONCURRENT_PROCESSES` | Number of repos to process concurrently | `2` |
| `REPOSITORY_UPDATE_INTERVAL_MS` | Time between updates | `3600000` (1 hour) |
| `MAX_EMBEDDING_BATCH_SIZE` | Chunks to process at once | `50` |
| `INCREMENTAL_PROCESSING` | Only process new/changed content | `true` |
| `FAIL_FAST_ON_ERRORS` | Stop on errors | `true` |

These settings can be found in the `.env` file.

### 3. Manage GitHub Repositories

The system processes repositories listed in `git_repos.txt`. The current repositories are:

- https://github.com/life423/drewclark.io-portfolio
- https://github.com/life423/ai-platform-trainer
- https://github.com/life423/ascend-avoid
- https://github.com/life423/polyalphabetic-and-caesar_cipher

To add a new repository, add its fetch and push URLs to this file.

## Manual Processing

You can trigger manual processing of repositories using the admin API:

### Update All Repositories

```bash
curl -X POST http://localhost:3000/api/admin/repositories/update \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_ADMIN_TOKEN"}'
```

### Process a Specific Repository

```bash
curl -X POST http://localhost:3000/api/admin/repositories/process \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_ADMIN_TOKEN",
    "repositoryUrl": "https://github.com/life423/ai-platform-trainer"
  }'
```

## How It Works

1. The system clones or updates GitHub repositories to local storage
2. Code files are parsed into semantic units (functions, classes, etc.)
3. These units are chunked into smaller pieces for embedding
4. OpenAI API generates embeddings that capture the meaning
5. Embeddings are stored in Qdrant vector database
6. When answering questions, semantically relevant code is retrieved
7. Chat prompts are enhanced with these code snippets for accurate responses

## Troubleshooting

### Qdrant Connection Issues

If the server can't connect to Qdrant, it will fall back to a mock implementation in development mode. 
To fix connection issues:

1. Make sure Qdrant is running: `docker ps | grep qdrant`
2. Check logs: `docker logs <container_id>`
3. Verify ports are open: `netstat -an | grep 6333`
4. Restart Qdrant: `docker-compose -f docker-compose-qdrant.yml restart`

### Repository Processing Issues

Processing logs are output to the server console. If processing fails:

1. Check repository URL is correct in `git_repos.txt`
2. Verify directory permissions in the data/repositories folder
3. Check GitHub access (public repos should work without issues)
4. Try increasing timeouts for large repositories
5. Use the manual API endpoints to process specific repositories

### CI/CD Pipeline Issues

The GitHub Actions workflow has been optimized to prevent long-running builds. If you have issues:

1. Build timeouts are set to 30 minutes total, 20 minutes for Docker
2. Cache dependencies using the Node.js cache action
3. Testing is done directly without Docker to improve speed
4. Mock implementations are used for tests to avoid API calls

## Maintenance

Regular tasks:

1. Keep repositories in `git_repos.txt` up to date
2. Monitor server logs for processing issues
3. Back up Qdrant data volume for persistent storage
4. Update environment variables as project grows
5. Monitor API key usage for OpenAI embeddings
