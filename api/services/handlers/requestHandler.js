/**
 * Request Handler Service
 * 
 * Provides a unified interface for handling HTTP requests to the AI API.
 * This handler is used by both Express.js server and Azure Functions.
 */

const { getChatCompletion } = require('../ai/openaiService');
const { buildChatMessages, findProject, searchableRepos, repoLabel } = require('../ai/promptBuilder');
const { searchCode } = require('../codeIndex/codeSearch');
const { checkCache, cacheResponse, generateCacheKey } = require('../cache/cacheService');
const config = require('../../config');

/**
 * Safety net: the UI renders plain text, so strip Markdown the model may still produce.
 * @param {string} text - Model output
 * @returns {string} Plain text
 */
function toPlainText(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/^```[^\n]*\n?/gm, '')       // ``` code fences (the code itself stays)
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold**
    .replace(/`([^`\n]+)`/g, '$1')         // `code`
    .replace(/^#{1,6}\s+/gm, '')          // # headings
    .replace(/^(\s*)[-*]\s+/gm, '$1• ');  // - bullets
}

/**
 * Where a code excerpt came from, with a link to those lines on GitHub
 * @param {Object} excerpt - Result from searchCode()
 * @returns {{project: string, file: string, lines: string, url: string}}
 */
function toSource(excerpt) {
  const { repo, path, startLine, endLine, commit } = excerpt;
  return {
    project: repoLabel(repo),
    file: path,
    lines: `${startLine}-${endLine}`,
    url: `https://github.com/${repo}/blob/${commit}/${encodeURI(path)}#L${startLine}-L${endLine}`
  };
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

  if (req.body.question.trim().length > config.chat.maxQuestionChars) {
    return createResponse(400, headers, {
      error: `Please keep questions under ${config.chat.maxQuestionChars} characters.`
    });
  }

  // Optional: answer about one project only
  let project = null;
  if (req.body.projectId !== undefined && req.body.projectId !== null) {
    project = findProject(req.body.projectId);
    if (!project) {
      return createResponse(400, headers, { error: 'Unknown project.' });
    }
  }

  // Used as-is: answers are rendered as text, never HTML
  const userQuestion = req.body.question.trim();
  logInfo(`Question: "${userQuestion.substring(0, 50)}${userQuestion.length > 50 ? '...' : ''}"`);

  // Model and limits are fixed on the server; anything the client sends is ignored
  const { model: modelName, temperature, maxTokens } = config.chat;
  logInfo(`Using model: ${modelName}, temperature: ${temperature}, maxTokens: ${maxTokens}`);

  // Identical questions about the same project are answered from the cache
  const cacheKey = generateCacheKey(userQuestion.toLowerCase(), modelName, temperature, maxTokens, project ? String(project.id) : 'all');
  const cachedResponse = checkCache(cacheKey);
  if (cachedResponse) {
    logInfo('Cache hit for question');
    return createResponse(200, headers, { ...cachedResponse, cached: true });
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
        error: errorMsg
      }
    });
  }

  // The code that best matches the question, from the project's repo (or every repo
  // for general questions). If the search is unavailable, answer from the descriptions.
  let excerpts = [];
  try {
    excerpts = await searchCode(userQuestion, searchableRepos(project));
    logInfo(`Code search: ${excerpts.length} excerpt(s)`);
  } catch (error) {
    logWarn(`Code search unavailable, answering from project descriptions only: ${error.message}`);
  }

  try {
    // The prompt is built here from the site's own project data; visitors only send the question
    const response = await getChatCompletion({
      model: modelName,
      messages: buildChatMessages({ question: userQuestion, project, excerpts }),
      temperature,
      maxTokens,
      logInfo,
      logError
    });

    const answer = toPlainText(response.answer);
    const sources = excerpts.map(toSource);
    cacheResponse(cacheKey, { answer, sources });

    return createResponse(200, headers, {
      answer,
      sources,
      metrics: {
        apiCallDurationMs: response.duration,
        codeExcerpts: excerpts.length,
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

module.exports = { handleRequest };
