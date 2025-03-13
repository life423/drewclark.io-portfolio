/**
 * API Configuration
 * 
 * This module centralizes the configuration for the API and loads the appropriate
 * environment variables based on the current environment.
 */

const path = require('path');

// Detect Azure Functions environment
const isAzureFunctions = process.env.WEBSITE_HOSTNAME !== undefined;

// Set NODE_ENV if not already set (important for Azure Functions)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = isAzureFunctions ? 'production' : 'development';
}

// Load appropriate .env file based on NODE_ENV
if (!isAzureFunctions) {
  // Only load from .env files in local development
  require('dotenv').config({
    path: process.env.NODE_ENV === 'production' 
      ? path.resolve(__dirname, '.env.production')
      : path.resolve(__dirname, '.env.development')
  });
}

// Log environment detection for debugging
console.log(`API environment: ${process.env.NODE_ENV}`);
console.log(`Running in Azure Functions: ${isAzureFunctions}`);
if (isAzureFunctions) {
  console.log(`Azure Functions hostname: ${process.env.WEBSITE_HOSTNAME}`);
}

// Configuration object with all settings centralized
const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isAzureFunctions,
  
  // API Keys
  openAiApiKey: process.env.OPENAI_API_KEY,
  
  // Rate Limiting
  rateLimitRequests: 10,
  rateLimitWindowMs: 60000, // 1 minute
  
  // Response Caching
  cacheTtlMs: 3600000, // 1 hour
  
  // Models
  allowedModels: [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo-16k',
  ],
  
  // CORS settings
  corsOrigins: ['*'], // You might want to restrict this to specific domains in production
  
  // Logging
  isDevelopment: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
};

// Log OpenAI API key status (without revealing the key)
if (config.openAiApiKey) {
  console.log(`OpenAI API key is configured (${config.openAiApiKey.length} characters)`);
} else {
  console.log('WARNING: OpenAI API key is missing');
}

module.exports = config;
