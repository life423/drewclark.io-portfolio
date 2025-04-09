/**
 * Unified Server Handler
 * 
 * This module provides a unified request handling interface that works across
 * different environments (Express.js server and Azure Functions).
 */

const OpenAI = require('openai');
const config = require('./config');
const codeContextService = require('./services/codeContext/codeContextService');

/**
 * Enhanced LRU cache implementation with size limits
 * This prevents memory leaks by limiting both the number of entries and
 * performing periodic cleanup of expired items
 */
class LRUCache {
  constructor(maxSize = 1000, ttl = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.lastCleanup = Date.now();
    this.cleanupInterval = 60000; // Cleanup every minute
  }

  get(key) {
    this.maybeCleanup();
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update timestamp to mark as recently used
    item.timestamp = Date.now();
    
    // Move to the end to maintain LRU order
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }

  set(key, data) {
    this.maybeCleanup();
    
    // Enforce size limit by removing least recently used items
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    });
  }

  // Cleanup expired items when needed
  maybeCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.lastCleanup = now;
      
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.ttl) {
          this.cache.delete(key);
        }
      }
    }
  }
}

// Initialize the cache
const responseCache = new LRUCache(1000, config.cacheTtlMs);

// Initialize OpenAI client
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

/**
 * Unified request handler that works with both Express and Azure Functions
 */
async function handleRequest({ req, createResponse, logInfo, logError, logWarn }) {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-Id'
  };

  try {
    // Handle different HTTP methods
    if (req.method === 'OPTIONS') {
      return handleOptionsRequest(createResponse, headers, logInfo);
    } else if (req.method === 'GET') {
      return handleGetRequest(createResponse, headers, logInfo);
    } else if (req.method === 'POST') {
      return await handlePostRequest(req, createResponse, headers, { logInfo, logError, logWarn });
    } else {
      logWarn(`Unsupported method: ${req.method}`);
      return createResponse(405, headers, { error: 'Method not allowed' });
    }
  } catch (error) {
    // Global error handler
    logError(`Unhandled error: ${error.message}`);
    logError(error.stack);
    return createResponse(500, headers, { 
      error: 'An unexpected error occurred',
      message: config.isDevelopment ? error.message : 'Internal server error' 
    });
  }
}

// Handle OPTIONS request (CORS preflight)
function handleOptionsRequest(createResponse, headers, logInfo) {
  logInfo('Handling OPTIONS request (CORS preflight)');
  return createResponse(200, headers, {});
}

// Handle GET request (health check)
function handleGetRequest(createResponse, headers, logInfo) {
  logInfo('Handling GET request (health check)');
  return createResponse(200, headers, {
    message: 'askGPT is alive! Use POST with a JSON body containing a "question" field.',
    version: '1.2.0',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    openAiInitError: openAiInitError // Will be null if no initialization errors occurred
  });
}

/**
 * Extract GitHub repository URL from a question
 * @param {string} question - User question
 * @returns {string|null} GitHub repository URL or null if not found
 */
function extractRepositoryUrl(question) {
  // Simple pattern to extract GitHub URLs
  const githubUrlPattern = /(https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/g;
  const matches = question.match(githubUrlPattern);
  
  if (matches && matches.length > 0) {
    return matches[0]; // Return the first match
  }
  
  // Always include portfolio repo URL if not explicitly mentioned
  // This ensures we have context about our own app
  if (question.toLowerCase().includes('portfolio') || 
      question.toLowerCase().includes('drewclark.io') || 
      question.toLowerCase().includes('this project') || 
      question.toLowerCase().includes('this app') ||
      question.toLowerCase().includes('this website')) {
    return 'https://github.com/life423/drewclark.io-portfolio';
  }
  
  return null;
}

// Handle POST request (main functionality)
async function handlePostRequest(req, createResponse, headers, { logInfo, logError, logWarn }) {
  logInfo('Handling POST request for question');

  // Validate input
  if (!req.body || typeof req.body.question !== 'string' || req.body.question.trim() === '') {
    logWarn('Invalid request: Missing or empty question');
    return createResponse(400, headers, {
      error: 'Missing or invalid question parameter. Please provide a non-empty question string.'
    });
  }

  // Get and sanitize the question
  const userQuestion = sanitizeInput(req.body.question.trim());
  logInfo(`Question: "${userQuestion.substring(0, 50)}${userQuestion.length > 50 ? '...' : ''}"`);

  // Determine which feature is making the request
  const feature = req.feature || 'default';
  
  // Rate limiting check with feature-specific bucket
  const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  if (isRateLimited(clientIp, feature)) {
    logWarn(`Rate limit exceeded for IP: ${clientIp} on feature: ${feature}`);
    return createResponse(429, headers, {
      error: 'Too many requests. Please try again later.',
      feature: feature,
      recommendedWait: '10 seconds'
    });
  }

  // Extract configuration from request or use defaults
  const modelName = req.body.model && isValidModel(req.body.model) 
    ? req.body.model 
    : 'gpt-3.5-turbo';

  const temperature = req.body.temperature !== undefined && 
    req.body.temperature >= 0 && 
    req.body.temperature <= 1
      ? req.body.temperature
      : 0.7;

  const maxTokens = req.body.maxTokens && 
    req.body.maxTokens > 0 && 
    req.body.maxTokens <= 4000
      ? req.body.maxTokens
      : 500;

  logInfo(`Using model: ${modelName}, temperature: ${temperature}, maxTokens: ${maxTokens}`);

  // Enhanced with repository context if available
  let enhancedQuestion = userQuestion;
  let repositoryUrl = req.body.repositoryUrl;
  let usingRepoContext = false;

  // Check if a repository URL was provided or can be extracted from the question
  if (!repositoryUrl) {
    repositoryUrl = extractRepositoryUrl(userQuestion);
  }

  // For the projects endpoint, we always want to check for repository context
  if (feature === 'projects' && repositoryUrl) {
    try {
      logInfo(`Enhancing question with context from repository: ${repositoryUrl}`);
      
      // This will add code context to the question
      const questionWithContext = await codeContextService.enhanceQuestionWithCodeContext(
        userQuestion,
        repositoryUrl,
        3 // Limit to 3 code snippets
      );
      
      if (questionWithContext !== userQuestion) {
        enhancedQuestion = questionWithContext;
        usingRepoContext = true;
        logInfo('Successfully enhanced question with repository code context');
      } else {
        logInfo('No relevant code context found for this question');
      }
    } catch (error) {
      logWarn(`Failed to enhance question with code context: ${error.message}`);
      // Continue with the original question if enhancement fails
    }
  }

  // Check cache for identical questions (with same parameters)
  const cacheKey = `${userQuestion}|${modelName}|${temperature}|${maxTokens}|${repositoryUrl || ''}`;
  const cachedResponse = checkCache(cacheKey);
  if (cachedResponse) {
    logInfo('Cache hit for question');
    return createResponse(200, headers, {
      answer: cachedResponse,
      cached: true,
      repositoryContext: usingRepoContext ? repositoryUrl : undefined
    });
  }

  // Get API key from config
  const apiKey = config.openAiApiKey;

  // Check if API key is provided
  if (!apiKey) {
    const errorMsg = 'Missing OpenAI API key. Returning development mode response.';
    logWarn(errorMsg);

    // For development, return a mock response if no API key is available
    return createResponse(200, headers, {
      answer: `[DEVELOPMENT MODE] OpenAI API key not configured. Your question was: "${userQuestion}"`,
      note: 'To use the real GPT model, set your OPENAI_API_KEY in Application Settings.',
      debug: {
        environment: process.env.NODE_ENV || 'not set',
        hasApiKey: !!apiKey,
        error: errorMsg,
        usingRepoContext: usingRepoContext
      }
    });
  }

  // Use the pre-initialized OpenAI client or try to initialize again if needed
  let openai = openAiClient;

  // If the global client initialization failed, try again
  if (!openai && apiKey) {
    try {
      logInfo('Attempting to initialize OpenAI client');
      openai = new OpenAI({ apiKey });
      logInfo('OpenAI client initialized successfully during request');
    } catch (error) {
      const errorMsg = `Failed to initialize OpenAI client: ${error.message}`;
      logError(errorMsg);
      return createResponse(500, headers, {
        error: 'Failed to initialize OpenAI API client',
        message: errorMsg,
        details: {
          apiKeyLength: apiKey ? apiKey.length : 0,
          environment: process.env.NODE_ENV || 'not set'
        }
      });
    }
  } else if (!openai) {
    const errorMsg = 'OpenAI API key is missing or invalid';
    logError(errorMsg);
    return createResponse(500, headers, {
      error: errorMsg,
      apiKeyStatus: apiKey ? 'present but may be invalid' : 'missing',
      details: {
        environment: process.env.NODE_ENV || 'not set'
      }
    });
  }

  try {
    // Call the OpenAI API with configurable parameters and enhanced error handling
    logInfo(`Calling OpenAI API with model ${modelName}`);

    const startTime = Date.now();
    let response;

    try {
      // Create system prompt based on whether we're using repository context
      const systemPrompt = usingRepoContext 
        ? "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors. You have been provided with relevant code snippets from the repository to help answer questions about the code. Refer to these code snippets when answering questions about how the code works. Keep responses concise, informative, and friendly."
        : "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors. Keep responses concise, informative, and friendly.";

      response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: enhancedQuestion
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      });
    } catch (error) {
      // Detailed error logging for OpenAI API errors
      logError(`OpenAI API error: ${error.message}`);
      
      // Categorize common OpenAI errors
      if (error.status === 401) {
        throw new Error(`Authentication error: Invalid API key. Original message: ${error.message}`);
      } else if (error.status === 429) {
        throw new Error(`Rate limit exceeded. Original message: ${error.message}`);
      } else if (error.status === 500) {
        throw new Error(`OpenAI server error. Original message: ${error.message}`);
      } else if (error.status === 400) {
        throw new Error(`Invalid request to OpenAI API. Original message: ${error.message}`);
      } else if (error.name === 'TimeoutError' || (error.message && error.message.includes('timeout'))) {
        throw new Error(`OpenAI API request timed out. Original message: ${error.message}`);
      } else {
        throw new Error(`Unexpected error from OpenAI API: ${error.message}. Error type: ${error.name || 'unknown'}`);
      }
    }

    const apiCallDuration = Date.now() - startTime;
    logInfo(`Received successful response from OpenAI API in ${apiCallDuration}ms`);

    // Get the response text
    const answer = response.choices[0].message.content;

    // Store in cache
    cacheResponse(cacheKey, answer);

    // Return the answer
    return createResponse(200, headers, {
      answer,
      repositoryContext: usingRepoContext ? repositoryUrl : undefined,
      metrics: {
        apiCallDurationMs: apiCallDuration,
        enhancedPrompt: usingRepoContext
      }
    });
  } catch (error) {
    // Handle specific OpenAI API errors
    logError(`Error calling OpenAI: ${error.message}`);

    if (error.status === 429) {
      return createResponse(429, headers, {
        error: 'OpenAI rate limit exceeded. Please try again later.',
        message: error.message
      });
    }

    if (error.status === 400) {
      return createResponse(400, headers, {
        error: 'Invalid request to OpenAI API. Your question may be too long.',
        message: error.message
      });
    }

    if (error.status === 401) {
      return createResponse(401, headers, {
        error: 'Authentication error with OpenAI API. Please check your API key.',
        message: error.message,
        debug: process.env.NODE_ENV === 'development' ? {
          apiKeyLength: apiKey ? apiKey.length : 0
        } : undefined
      });
    }

    // General error response
    return createResponse(500, headers, {
      error: 'Failed to get answer from OpenAI',
      message: config.isDevelopment ? error.message : 'An error occurred while processing your request'
    });
  }
}

// Enhanced input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // More thorough sanitization
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:[^,]*,/gi, '') // Remove data: URI scheme
    .trim();
}

// Simple validation of model names
function isValidModel(model) {
  return config.allowedModels.includes(model);
}

// Enhanced rate limiting with feature-specific buckets
const rateLimitMap = new Map();

/**
 * Check if a request is rate limited
 * @param {string} clientIp - Client IP address
 * @param {string} feature - Feature identifier (connect4, projects, default)
 * @returns {boolean} Whether the request is rate limited
 */
function isRateLimited(clientIp, feature = 'default') {
  const now = Date.now();
  
  // Get global limit and window
  const globalLimit = config.rateLimitRequests;
  const globalWindow = config.rateLimitWindowMs;
  
  // Get feature-specific limit and window if available
  const featureConfig = config.featureRateLimits[feature];
  const featureLimit = featureConfig ? featureConfig.requests : globalLimit;
  const featureWindow = featureConfig ? featureConfig.windowMs : globalWindow;
  
  // Create a client-specific key in the map if it doesn't exist
  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, {
      global: [],
      projects: [],
      default: []
    });
  }
  
  const clientData = rateLimitMap.get(clientIp);
  
  // Initialize feature bucket if it doesn't exist
  if (!clientData[feature]) {
    clientData[feature] = [];
  }
  
  // Update global request history
  let globalRequests = clientData.global;
  globalRequests = globalRequests.filter(timestamp => now - timestamp < globalWindow);
  
  // Update feature-specific request history
  let featureRequests = clientData[feature];
  featureRequests = featureRequests.filter(timestamp => now - timestamp < featureWindow);
  
  // Check if either limit is exceeded
  if (globalRequests.length >= globalLimit || featureRequests.length >= featureLimit) {
    return true; // Rate limited
  }
  
  // Record this request in both global and feature-specific buckets
  globalRequests.push(now);
  featureRequests.push(now);
  
  // Update the client data in the map
  clientData.global = globalRequests;
  clientData[feature] = featureRequests;
  rateLimitMap.set(clientIp, clientData);
  
  return false; // Not rate limited
}

// Cache helpers simplified to use the LRUCache implementation
function checkCache(key) {
  return responseCache.get(key);
}

function cacheResponse(key, data) {
  responseCache.set(key, data);
}

module.exports = {
  handleRequest,
  isRateLimited
};
