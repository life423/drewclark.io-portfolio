# Code Repository Integration System

This document provides details about the enhanced repository integration system for the drewclark.io portfolio application. The system enables the AI to have deep knowledge of the codebase when answering questions.

## Overview

The newly implemented system allows the AI assistant to:

1. Process and analyze GitHub repositories mentioned in projects
2. Extract semantic meaning from code through advanced parsing and chunking
3. Generate embeddings that capture the semantic essence of code units
4. Store these embeddings in a vector database for efficient retrieval
5. Enhance AI prompts with relevant code context when answering questions

This creates a significantly improved experience for users asking questions about the projects, as the AI can now reference specific code implementations and understand the structure of the repositories.

## System Architecture

The system consists of the following components:

### Repository Management

- **Repository Storage Service** (`api/services/repositories/repoStorageService.js`)
  - Manages local storage of repositories
  - Provides path resolution for cloned repositories

- **Repository Clone Service** (`api/services/repositories/repoCloneService.js`)
  - Handles cloning repositories from GitHub
  - Updates existing repositories to ensure they're current
  - Retrieves repository metadata

- **Repository Discovery Service** (`api/services/repositories/repoDiscoveryService.js`)
  - Identifies GitHub repositories mentioned in projects
  - Maintains a list of known repositories to be processed

### Code Processing

- **File Filter Service** (`api/services/codeProcessing/fileFilterService.js`)
  - Determines which files should be processed (ignores binaries, libraries, etc.)
  - Assigns priority to files based on importance

- **Code Parser Service** (`api/services/codeProcessing/codeParserService.js`)
  - Parses code files into semantic units (functions, classes, methods)
  - Extracts meaningful code segments with context

- **Chunking Service** (`api/services/codeProcessing/chunkingService.js`)
  - Breaks large code units into smaller chunks for embedding
  - Implements semantic chunking and sliding window approaches

### Vector Database Integration

- **Qdrant Service** (`api/services/vectorDb/qdrantService.js`)
  - Interfaces with the Qdrant vector database
  - Manages collections for code embeddings
  - Provides search capabilities for similar code

- **Embedding Service** (`api/services/embeddings/embeddingService.js`)
  - Generates vector embeddings for code chunks
  - Uses OpenAI's embedding API with fallback to mock implementations

### AI Context Enhancement

- **Code Context Service** (`api/services/codeContext/codeContextService.js`)
  - Enhances AI prompts with relevant code snippets
  - Retrieves semantically similar code for user questions

### Scheduling and Updates

- **Repository Update Service** (`api/services/scheduler/repositoryUpdateService.js`)
  - Manages background processing of repositories
  - Schedules periodic updates to keep embeddings current

## Docker Integration

The system uses Qdrant as a vector database, which is configured in `docker-compose.yml`. This enables efficient storage and retrieval of code embeddings.

## Configuration

The vector database and embedding settings are configured in `api/config.js`:

```javascript
// Vector Database Configuration
vectorDb: {
  url: process.env.VECTOR_DB_URL || 'http://localhost:6333',
  embeddingModel: 'text-embedding-ada-002',
  collections: {
    codeEmbeddings: 'code_embeddings',
    documentEmbeddings: 'document_embeddings',
    commitEmbeddings: 'commit_embeddings'
  },
  dimensions: 1536, // OpenAI Ada embedding dimension
  updateIntervalMs: 3600000, // How often to check for repository updates (1 hour)
},
```

## Administration

Repository processing can be triggered manually through admin endpoints:

1. Update all repositories:
   ```http
   POST /api/admin/repositories/update
   Content-Type: application/json
   
   {
     "token": "admin_token"
   }
   ```

2. Process a specific repository:
   ```http
   POST /api/admin/repositories/process
   Content-Type: application/json
   
   {
     "token": "admin_token",
     "repositoryUrl": "https://github.com/life423/drewclark.io-portfolio"
   }
   ```

## How It Works

1. **Repository Discovery**: The system identifies GitHub repositories mentioned in project descriptions.
2. **Code Processing**: Repositories are cloned, and their code is parsed into semantic units.
3. **Embedding Generation**: These units are chunked and converted into vector embeddings.
4. **Vector Storage**: Embeddings are stored in the Qdrant vector database.
5. **Context Enhancement**: When a user asks a question, relevant code is retrieved and added to the AI prompt.
6. **Enhanced Response**: The AI provides more accurate answers with specific code references.

## Testing

A test script is available at `api/scripts/test-repo-processing.js` to verify the functionality of the repository processing system.

Run it with:
```
node api/scripts/test-repo-processing.js
```

## Mock Implementation Support

Both the vector database and embedding services include mock implementations for development and testing without requiring actual OpenAI API keys or a running Qdrant server.

## Conclusion

This implementation significantly enhances the AI assistant's ability to understand and explain code repositories. The system is designed to be efficient, scalable, and provide meaningful code context to improve the quality of AI-generated responses about the projects.
