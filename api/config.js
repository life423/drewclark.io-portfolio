/**
 * API Configuration
 *
 * This module centralizes the configuration for the API and loads the appropriate
 * environment variables based on the current environment.
 */

const path = require('path')

// Detect Azure Functions environment
const isAzureFunctions = process.env.WEBSITE_HOSTNAME !== undefined

// Set NODE_ENV if not already set (important for Azure Functions)
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = isAzureFunctions ? 'production' : 'development'
}

// Load appropriate .env file based on NODE_ENV
if (!isAzureFunctions) {
    // Only load from .env files in local development
    try {
        require('dotenv').config({
            path:
                process.env.NODE_ENV === 'production'
                    ? path.resolve(__dirname, '.env.production')
                    : path.resolve(__dirname, '.env.development'),
        })
    } catch (error) {
        console.warn(`Warning: Could not load .env file - ${error.message}`)
    }
}

// Log environment detection for debugging
console.log(`API environment: ${process.env.NODE_ENV}`)
console.log(`Running in Azure Functions: ${isAzureFunctions}`)
if (isAzureFunctions) {
    console.log(`Azure Functions hostname: ${process.env.WEBSITE_HOSTNAME}`)
}

// Enhanced environment variable debugging
console.log('Environment variables for OpenAI debugging:')
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY)
if (process.env.OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY.length)
    console.log('OPENAI_API_KEY format check:', 
        process.env.OPENAI_API_KEY.startsWith('sk-') ? 'Valid format (starts with sk-)' : 'Invalid format')
}

// Configuration object with all settings centralized
const config = {
    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',
    isAzureFunctions,

    // API Keys
    openAiApiKey: process.env.OPENAI_API_KEY,
    githubToken: process.env.GITHUB_TOKEN,

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

    // Models
    allowedModels: [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-3.5-turbo-16k',
    ],

    // CORS settings
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['*'],

    // Vector Database Configuration
    vectorDb: {
        // Code context for the chat is off unless a vector database is configured
        enabled: Boolean(process.env.VECTOR_DB_URL),
        url: process.env.VECTOR_DB_URL || 'http://localhost:6333',
        apiKey: process.env.VECTOR_DB_API_KEY, // Add this line
        embeddingModel: 'text-embedding-ada-002',
        collections: {
            codeEmbeddings: 'code_embeddings',
            documentEmbeddings: 'document_embeddings',
            commitEmbeddings: 'commit_embeddings',
        },
        dimensions: 1536, // OpenAI Ada embedding dimension
        updateIntervalMs: 3600000, // How often to check for repository updates (1 hour)
    },

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

    // Repository Storage Configuration
    repositories: {
        // Default repositories to always include
        defaultRepos: ['https://github.com/life423/drewclark.io-portfolio'],
        // The only repositories the chat and the admin tools may use
        allowed: (process.env.ALLOWED_REPOS || 'life423/drewclark.io-portfolio,life423/ai-platform-trainer,life423/ascend-avoid,life423/polyalphabetic-and-caesar_cipher')
            .split(',')
            .map(name => name.trim().toLowerCase())
            .filter(Boolean),
        // How often to sync repositories with GitHub (1 hour)
        syncIntervalMs: 3600000,
        // This website's own repo (project repos are listed in projects.json)
        siteRepo: 'life423/drewclark.io-portfolio',
    },

    // Logging
    isDevelopment: process.env.NODE_ENV !== 'production',
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
}

// Log API keys status (without revealing the keys)
if (config.openAiApiKey) {
    console.log(
        `OpenAI API key is configured (${config.openAiApiKey.length} characters)`
    )
} else {
    console.log('WARNING: OpenAI API key is missing')
}

if (config.githubToken) {
    console.log(
        `GitHub token is configured (${config.githubToken.length} characters)`
    )
} else {
    console.log(
        'Note: GitHub token is not configured. Public repository access only.'
    )
}

module.exports = config
