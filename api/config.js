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

// Configuration object with all settings centralized
const config = {
    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',
    isAzureFunctions,

    // API Keys
    openAiApiKey: process.env.OPENAI_API_KEY,
    githubToken: process.env.GITHUB_TOKEN,

    // Rate Limiting
    rateLimitRequests: 30, // Increased global limit
    rateLimitWindowMs: 60000, // 1 minute

    // Feature-specific rate limits
    featureRateLimits: {
        projects: {
            requests: 15,
            windowMs: 60000, // 1 minute
        },
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

    // Repository Storage Configuration
    repositories: {
        // Default repositories to always include
        defaultRepos: ['https://github.com/life423/drewclark.io-portfolio'],
        // How often to sync repositories with GitHub (1 hour)
        syncIntervalMs: 3600000,
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
