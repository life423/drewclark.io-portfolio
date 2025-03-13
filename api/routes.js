const express = require('express');
const router = express.Router();
const { generateCorrelationId, sanitizeInput, isRateLimited, checkCache, cacheResponse } = require('./utils');
const config = require('./config');
const { OpenAI } = require('openai');

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

// Health check endpoint (GET)
router.get('/askGPT', (req, res) => {
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
router.post('/askGPT', async (req, res) => {
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
      req.body.model && config.allowedModels.includes(req.body.model)
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

    return await handleOpenAIRequest(req, res, {
      userQuestion, 
      modelName, 
      temperature, 
      maxTokens, 
      cacheKey, 
      correlationId
    });
  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
    console.error(error);
    
    return res.status(500).json({
      error: 'An unexpected error occurred.',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later.',
    });
  }
});

// Helper function to handle OpenAI API requests
async function handleOpenAIRequest(req, res, params) {
  const { userQuestion, modelName, temperature, maxTokens, cacheKey, correlationId } = params;
  
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
      return handleOpenAIError(error, res);
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
    return handleOpenAIError(error, res);
  }
}

// Helper function to handle OpenAI errors
function handleOpenAIError(error, res) {
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

module.exports = router;
