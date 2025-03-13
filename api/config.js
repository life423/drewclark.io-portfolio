/**
 * API Configuration
 * 
 * This module centralizes the configuration for the API and loads the appropriate
 * environment variables based on the current environment.
 */

const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' 
    ? path.resolve(__dirname, '.env.production')
    : path.resolve(__dirname, '.env.development')
});

// Configuration object with all settings centralized
const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
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
  
  // Logging
  isDevelopment: process.env.NODE_ENV !== 'production',
};

module.exports = config;
