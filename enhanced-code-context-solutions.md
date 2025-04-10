# AI Chat System with Enhanced Code Context

This document outlines improvements made to the portfolio's AI chat system, particularly focusing on the Qdrant vector integration and code organization.

## Major Improvements

### 1. Fixed Vector ID Collision Issue

The system now properly handles multiple chunks from the same file by including chunk-specific information in the vector IDs:

- Modified `generatePointId` in `qdrantService.js` to include chunk metadata (partIndex, line ranges)
- Updated repository processing code to pass chunk objects to the ID generation function
- This ensures each chunk gets a unique ID, preventing data loss during indexing

### 2. Unified Repository Context Behavior

Repository context is now available across all endpoints:

- Modified request handling to use code context whenever a repository URL is available
- No longer limits context to only the `/projects` endpoint
- Improves consistency of answers across all API routes

### 3. Improved Context Selection with Token Management

Added smarter context selection and token management:

- Created `tokenUtils.js` module with functions for estimating token usage
- Added similarity score filtering (minimum threshold 0.65)
- Implemented file diversity prioritization in result selection
- Added token budget management to prevent exceeding model context limits
- Will truncate content if needed to fit within token limits

### 4. Modularized Code Architecture

Refactored the large unified-server.js (2100+ lines) into smaller, focused modules:

- **Cache Service**: Extracted LRU cache implementation
- **OpenAI Service**: Handles API interactions with OpenAI
- **Rate Limit Service**: Manages rate limiting functionality
- **Repository Utilities**: Handles URL extraction and normalization
- **Request Handler**: Core handler with separated concern from HTTP specifics
- **Route Adapter**: Connects Express routes to the unified handler

## Module Organization

```
api/
├── services/
│   ├── ai/
│   │   └── openaiService.js    # OpenAI API interactions
│   ├── cache/
│   │   └── cacheService.js     # Response caching
│   ├── codeContext/
│   │   ├── codeContextService.js  # Code context enhancement
│   │   └── tokenUtils.js       # Token estimation & management
│   ├── handlers/
│   │   └── requestHandler.js   # Core request processing
│   ├── repositories/
│   │   ├── repoCloneService.js # Repository cloning
│   │   └── repoUtils.js        # Repository URL utilities
│   ├── security/
│   │   └── rateLimitService.js # Rate limiting
│   └── vectorDb/
│       └── qdrantService.js    # Vector database interactions
├── routes/
│   └── askGptAdapter.js        # Express route adapter
└── unified-server.js           # Simplified entry point
```

## Compatibility

All changes maintain backward compatibility:

- Existing routes continue to work through adapter layer
- API responses maintain the same structure
- Rate limiting still works on a per-feature basis
- Cache keys are generated consistently with the previous implementation

## UI Improvements

### 5. Enhanced Chat Message Scrolling

Modified the UnifiedProjectChat component to improve user experience with long messages:

- Changed auto-scrolling behavior to ensure users see the beginning of new messages
- Added smarter logic to distinguish between user messages and AI responses
- For user messages: continues to scroll to bottom (conventional behavior)
- For AI responses: scrolls to show the beginning of the message
- This prevents users from missing the first part of long AI responses

## Future Improvements

Potential future enhancements:

1. **On-Demand Indexing**: Add background job processing for repositories that aren't yet indexed
2. **Documentation & Commit Embedding**: Implement the planned documentEmbeddings and commitEmbeddings collections
3. **More Advanced Context Selection**: Consider implementing semantic clustering for even better snippet selection
4. **Performance Monitoring**: Add instrumentation to track context enhancement performance
5. **Response Summarization**: For very long responses, consider adding an option to see a summary first

## Related Files

Key files involved in the vector integration:

- `api/services/vectorDb/qdrantService.js` - Vector database interaction
- `api/services/embeddings/embeddingService.js` - Text embedding generation
- `api/services/codeContext/codeContextService.js` - Context enhancement
- `api/services/codeProcessing/chunkingService.js` - Code chunking
- `api/scripts/test-repo-processing.js` - Repository processing pipeline
