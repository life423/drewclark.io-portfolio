<<<<<<< HEAD
/**
 * Main server file for the Drew Clark Portfolio application
 * 
 * This file sets up the Express server and serves both the API and frontend application.
 * The API functionality has been modularized into separate files for better maintainability.
 */

const express = require('express');
const path = require('path');
=======
const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');
>>>>>>> life423/main
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

<<<<<<< HEAD
// Import API routes and utilities
const apiRoutes = require('./api/routes');
const { setCacheTTL } = require('./api/utils');
const config = require('./api/config');

// Set cache TTL based on config
setCacheTTL(config.cacheTtlMs);

=======
>>>>>>> life423/main
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

<<<<<<< HEAD
// API routes
app.use('/api', apiRoutes);
=======
// Configuration
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
  
  // CORS settings
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  
  // Logging
  isDevelopment: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
};

// Simple in-memory cache (consider using a distributed cache in production)
const responseCache = new Map();
const CACHE_TTL = config.cacheTtlMs;

// Initialize OpenAI Client
let openAiClient = null;
let openAiInitError = null;

try {
  if (config.openAiApiKey) {
    openAiClient = new OpenAI({ apiKey: config.openAiApiKey });
    console.log('OpenAI client initialized successfully');
  } else {
    openAiInitError = 'OpenAI API key is missing';
    console.error('Failed to initialize OpenAI client: API key missing');
  }
} catch (error) {
  openAiInitError = error.message;
  console.error(`Failed to initialize OpenAI client: ${error.message}`);
}

// Utilities
function generateCorrelationId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function sanitizeInput(input) {
  // Remove any HTML/script tags
  return input.replace(/<[^>]*>?/gm, '');
}

function isValidModel(model) {
  return config.allowedModels.includes(model);
}

// Simple in-memory rate limiting
const rateLimitMap = new Map();
function isRateLimited(clientIp) {
  const now = Date.now();
  const limit = 10; // 10 requests
  const window = 60000; // per minute

  // Initialize or update rate limit tracking
  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, []);
  }

  // Get request history and filter out old requests
  let requests = rateLimitMap.get(clientIp);
  requests = requests.filter(timestamp => now - timestamp < window);

  // Check if limit is exceeded
  if (requests.length >= limit) {
    return true; // Rate limited
  }

  // Record this request
  requests.push(now);
  rateLimitMap.set(clientIp, requests);

  return false; // Not rate limited
}

// Cache helpers
function checkCache(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function cacheResponse(key, data) {
  responseCache.set(key, {
    timestamp: Date.now(),
    data,
  });

  // Clean up old cache entries
  if (responseCache.size > 1000) {
    // Prevent unbounded growth
    const now = Date.now();
    for (const [k, v] of responseCache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        responseCache.delete(k);
      }
    }
  }
}

// API Endpoints

// Health check endpoint (GET)
app.get('/api/askGPT', (req, res) => {
  const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  
  console.log(`Health check request. CorrelationId: ${correlationId}`);
  
  res.json({
    message: 'askGPT is alive! Use POST with a JSON body containing a "question" field.',
    version: '1.1.0',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    openAiInitError: openAiInitError, // Will be null if no initialization errors occurred
  });
});

// Question endpoint (POST)
app.post('/api/askGPT', async (req, res) => {
  const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  console.log(`askGPT POST request. CorrelationId: ${correlationId}`);
  
  try {
    // Validate input
    if (!req.body || typeof req.body.question !== 'string' || req.body.question.trim() === '') {
      console.warn('Invalid request: Missing or empty question');
      return res.status(400).json({
        error: 'Missing or invalid question parameter. Please provide a non-empty question string.',
      });
    }

    // Get and sanitize the question
    const userQuestion = sanitizeInput(req.body.question.trim());
    console.log(
      `Question: "${userQuestion.substring(0, 50)}${
        userQuestion.length > 50 ? '...' : ''
      }"`
    );

    // Rate limiting check
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (isRateLimited(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
    }

    // Extract configuration from request or use defaults
    const modelName =
      req.body.model && isValidModel(req.body.model)
        ? req.body.model
        : 'gpt-3.5-turbo';

    const temperature =
      req.body.temperature !== undefined &&
      req.body.temperature >= 0 &&
      req.body.temperature <= 1
        ? req.body.temperature
        : 0.7;

    const maxTokens =
      req.body.maxTokens &&
      req.body.maxTokens > 0 &&
      req.body.maxTokens <= 4000
        ? req.body.maxTokens
        : 500;

    console.log(
      `Using model: ${modelName}, temperature: ${temperature}, maxTokens: ${maxTokens}`
    );

    // Check cache for identical questions
    const cacheKey = `${userQuestion}|${modelName}|${temperature}|${maxTokens}`;
    const cachedResponse = checkCache(cacheKey);
    if (cachedResponse) {
      console.log(`Cache hit for question (${correlationId})`);
      return res.json({
        answer: cachedResponse,
        cached: true,
      });
    }

    // Get API key from config
    const apiKey = config.openAiApiKey;

    // Check if API key is provided
    if (!apiKey || apiKey === 'your-api-key-here') {
      const errorMsg = 'Missing OpenAI API key. Returning development mode response.';
      console.warn(errorMsg);

      // For development, return a mock response if no API key is available
      return res.json({
        answer: `[DEVELOPMENT MODE] OpenAI API key not configured. Your question was: "${userQuestion}"`,
        note: 'To use the real GPT model, set your OPENAI_API_KEY in environment variables.',
        debug: {
          environment: process.env.NODE_ENV || 'not set',
          hasApiKey: !!apiKey,
          apiKeyIsDefault: apiKey === 'your-api-key-here',
          error: errorMsg,
        },
      });
    }

    // Use the initialized OpenAI client or initialize again if needed
    let openai = openAiClient;
    
    if (!openai && apiKey) {
      try {
        console.log('Attempting to initialize OpenAI client');
        openai = new OpenAI({ apiKey });
        console.log('OpenAI client initialized successfully during request');
      } catch (error) {
        const errorMsg = `Failed to initialize OpenAI client: ${error.message}`;
        console.error(errorMsg);
        return res.status(500).json({
          error: 'Failed to initialize OpenAI API client',
          message: errorMsg,
          details: {
            apiKeyLength: apiKey ? apiKey.length : 0,
            environment: process.env.NODE_ENV || 'not set',
            nodeVersion: process.version,
          },
        });
      }
    } else if (!openai) {
      const errorMsg = 'OpenAI API key is missing or invalid';
      console.error(errorMsg);
      return res.status(500).json({
        error: errorMsg,
        apiKeyStatus: apiKey ? 'present but may be invalid' : 'missing',
        details: {
          environment: process.env.NODE_ENV || 'not set',
        },
      });
    }

    try {
      // Call the OpenAI API
      console.log(`Calling OpenAI API with model ${modelName}`);
      
      const startTime = Date.now();
      let response;
      
      try {
        response = await openai.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: 'system',
              content:
                "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors. Keep responses concise, informative, and friendly.",
            },
            {
              role: 'user',
              content: userQuestion,
            },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        });
      } catch (error) {
        // Detailed error logging for OpenAI API errors
        console.error(`OpenAI API error: ${error.message}`);

        // Categorize common OpenAI errors
        if (error.status === 401) {
          throw new Error(
            `Authentication error: Invalid API key. Original message: ${error.message}`
          );
        } else if (error.status === 429) {
          throw new Error(
            `Rate limit exceeded. Original message: ${error.message}`
          );
        } else if (error.status === 500) {
          throw new Error(
            `OpenAI server error. Original message: ${error.message}`
          );
        } else if (error.status === 400) {
          throw new Error(
            `Invalid request to OpenAI API. Original message: ${error.message}`
          );
        } else {
          throw new Error(
            `Unexpected error from OpenAI API: ${
              error.message
            }. Error type: ${error.name || 'unknown'}`
          );
        }
      }

      const apiCallDuration = Date.now() - startTime;
      console.log(
        `Received successful response from OpenAI API in ${apiCallDuration}ms`
      );

      // Get the response text
      const answer = response.choices[0].message.content;

      // Store in cache
      cacheResponse(cacheKey, answer);

      // Return the answer
      return res.json({
        answer,
        metrics: {
          apiCallDurationMs: apiCallDuration,
        },
      });
    } catch (error) {
      // Handle specific OpenAI API errors
      console.error(`Error calling OpenAI: ${error.message}`);

      if (error.status === 429) {
        return res.status(429).json({
          error: 'OpenAI rate limit exceeded. Please try again later.',
          message: error.message,
        });
      }

      if (error.status === 400) {
        return res.status(400).json({
          error: 'Invalid request to OpenAI API. Your question may be too long.',
          message: error.message,
        });
      }

      if (error.status === 401) {
        return res.status(401).json({
          error: 'Authentication error with OpenAI API. Please check your API key.',
          message: error.message,
        });
      }

      // Generic error
      return res.status(500).json({
        error: 'An error occurred while processing your request.',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later.',
      });
    }
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    console.error(error);
    
    return res.status(500).json({
      error: 'An unexpected error occurred.',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later.',
    });
  }
});
>>>>>>> life423/main

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'app/dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`OpenAI API Key configured: ${!!config.openAiApiKey}`);
  if (config.openAiApiKey) {
    console.log(`OpenAI API Key length: ${config.openAiApiKey.length}`);
  }
});
