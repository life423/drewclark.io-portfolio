/**
 * Request Handler Service
 * 
 * Provides a unified interface for handling HTTP requests to the AI API.
 * This handler is used by both Express.js server and Azure Functions.
 */

const { getChatCompletion, createSystemPrompt, isValidModel } = require('../ai/openaiService');
const { extractRepositoryUrl } = require('../repositories/repoUtils');
const { enhanceQuestionWithCodeContext } = require('../codeContext/codeContextService');
const { checkCache, cacheResponse, generateCacheKey } = require('../cache/cacheService');
const { isRateLimited } = require('../security/rateLimitService');
const config = require('../../config');

/**
 * Sanitize input to prevent injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Thorough sanitization
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:[^,]*,/gi, '') // Remove data: URI scheme
    .trim();
}

/**
 * Handler for OPTIONS requests (CORS preflight)
 * @param {Function} createResponse - Response creator function
 * @param {Object} headers - HTTP headers
 * @param {Function} logInfo - Logging function
 * @returns {Object} Response object
 */
function handleOptionsRequest(createResponse, headers, logInfo) {
  logInfo('Handling OPTIONS request (CORS preflight)');
  return createResponse(200, headers, {});
}

/**
 * Handler for GET requests (health check)
 * @param {Function} createResponse - Response creator function
 * @param {Object} headers - HTTP headers
 * @param {Function} logInfo - Logging function
 * @returns {Object} Response object
 */
function handleGetRequest(createResponse, headers, logInfo) {
  logInfo('Handling GET request (health check)');
  
  // Get OpenAI initialization status
  const openAiInitError = require('../ai/openaiService').getInitError();
  
  return createResponse(200, headers, {
    message: 'askGPT is alive! Use POST with a JSON body containing a "question" field.',
    version: '1.2.1',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    openAiInitError // Will be null if no initialization errors occurred
  });
}

/**
 * Handler for POST requests (AI completion)
 * @param {Object} req - HTTP request object
 * @param {Function} createResponse - Response creator function
 * @param {Object} headers - HTTP headers
 * @param {Object} logger - Logger functions
 * @returns {Promise<Object>} Response object
 */
async function handlePostRequest(req, createResponse, headers, logger) {
  const { logInfo, logError, logWarn } = logger;
  
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

  // Enhance question with code context if repository URL is available
  if (repositoryUrl) {
    try {
      logInfo(`Enhancing question with context from repository: ${repositoryUrl}`);
      
      // This will add code context to the question
      const questionWithContext = await enhanceQuestionWithCodeContext(
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
  const cacheKey = generateCacheKey(userQuestion, modelName, temperature, maxTokens, repositoryUrl || '');
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

  try {
    // Create system prompt based on whether we're using repository context
    const systemPrompt = createSystemPrompt(usingRepoContext);
    
    // Call OpenAI with the configured parameters
    const response = await getChatCompletion({
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
      temperature,
      maxTokens,
      logInfo,
      logError
    });

    // Store in cache
    cacheResponse(cacheKey, response.answer);

    // Return the answer
    return createResponse(200, headers, {
      answer: response.answer,
      repositoryContext: usingRepoContext ? repositoryUrl : undefined,
      metrics: {
        apiCallDurationMs: response.duration,
        enhancedPrompt: usingRepoContext,
        tokenUsage: response.usage
      }
    });
  } catch (error) {
    // Handle specific OpenAI API errors
    logError(`Error calling OpenAI: ${error.message}`);

    if (error.message.includes('rate limit')) {
      return createResponse(429, headers, {
        error: 'OpenAI rate limit exceeded. Please try again later.',
        message: error.message
      });
    }

    if (error.message.includes('Invalid request')) {
      return createResponse(400, headers, {
        error: 'Invalid request to OpenAI API. Your question may be too long.',
        message: error.message
      });
    }

    if (error.message.includes('Authentication error')) {
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

/**
 * Unified request handler that works with both Express and Azure Functions
 * @param {Object} params - Handler parameters
 * @param {Object} params.req - HTTP request object
 * @param {Function} params.createResponse - Response creator function 
 * @param {Function} params.logInfo - Info logging function
 * @param {Function} params.logError - Error logging function
 * @param {Function} params.logWarn - Warning logging function
 * @returns {Promise<Object>} Response object
 */
async function handleRequest(params) {
  const { req, createResponse, logInfo, logError, logWarn } = params;
  
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

module.exports = {
  handleRequest,
  // Export component handlers for testing
  handleOptionsRequest,
  handleGetRequest,
  handlePostRequest,
  sanitizeInput
};
