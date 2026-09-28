/**
 * API configuration
 *
 * Everything the server reads from the environment. server.js and the scripts
 * load the root .env before requiring this file.
 */

// Without NODE_ENV, assume local development (the Docker image sets production)
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
}

// Configuration object with all settings centralized
const config = {
    // API Keys
    openAiApiKey: process.env.OPENAI_API_KEY,

    // Chat (/api/askGPT). Model and limits are fixed here; the client cannot change them.
    chat: {
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
        maxQuestionChars: 500, // visitors send just their question
        limitPerMinute: Number(process.env.CHAT_LIMIT_PER_MINUTE) || 10, // per visitor
        limitPerDay: Number(process.env.CHAT_LIMIT_PER_DAY) || 500, // whole site
    },

    // Response Caching
    cacheTtlMs: 3600000, // 1 hour

    // Other sites allowed to call the API from a browser (comma-separated origins).
    // The site itself is same-origin and needs none.
    corsOrigins: (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean),

    // Code-aware chat: scripts/index-repos.js embeds the allowed repos into
    // MongoDB Atlas Vector Search, and the chat searches them
    codeIndex: {
        enabled: Boolean(process.env.MONGODB_URI),
        embeddingModel: 'text-embedding-3-small',
        dimensions: 1536,
        chunksCollection: 'code_chunks',
        stateCollection: 'code_index_state',
        vectorIndexName: 'code_vector_index',
        // About 60 lines per chunk, overlapping so code split across two chunks shows up in both
        chunkLines: 60,
        overlapLines: 10,
        maxChunkChars: 3000,
        // Bigger files are almost always generated
        maxFileBytes: 150 * 1024,
        // Bump when chunking or the embedding model changes, to force a full re-index
        version: 1,
        // Chat search: the closest chunks, skipping weak matches, within a size budget
        searchLimit: 6,
        minScore: 0.68, // on-topic questions score about 0.7 and up, off-topic ones below 0.68
        maxContextChars: 12000,
        searchTimeoutMs: 4000,
    },

    // The repos the chat can search and scripts/index-repos.js embeds
    repositories: {
        allowed: (process.env.ALLOWED_REPOS || 'life423/drewclark.io-portfolio,life423/ai-platform-trainer,life423/ascend-avoid,life423/polyalphabetic-and-caesar_cipher')
            .split(',')
            .map(name => name.trim().toLowerCase())
            .filter(Boolean),
        // This website's own repo (project repos are listed in projects.json)
        siteRepo: 'life423/drewclark.io-portfolio',
    },

    // Error responses include details only in development
    isDevelopment: process.env.NODE_ENV !== 'production',
}


module.exports = config
