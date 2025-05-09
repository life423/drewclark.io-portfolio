const { OpenAI } = require('openai');
const { handleRequest, isRateLimited } = require('../unified-server');
const config = require('../config');
const githubUtils = require('../github-utils');

// Simple in-memory cache (consider using a distributed cache in production)
const responseCache = new Map();
const CACHE_TTL = config.cacheTtlMs;

// GitHub repository information extraction pattern
const GITHUB_URL_PATTERN = /https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+/g;

// Global variables to track errors and OpenAI client
let openAiInitError = null
let openAiClient = null

// Try to initialize OpenAI client ahead of time
try {
    if (config.openAiApiKey) {
        openAiClient = new OpenAI({ apiKey: config.openAiApiKey })
        console.log('OpenAI client initialized successfully')
    } else {
        openAiInitError = 'OpenAI API key is missing'
        console.error('Failed to initialize OpenAI client: API key missing')
    }
} catch (error) {
    openAiInitError = error.message
    console.error(`Failed to initialize OpenAI client: ${error.message}`)
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.')

    // Create adapter functions for unified server
    const createResponse = (status, headers, body) => {
        context.res = {
            status,
            headers,
            body,
        }
        return context.res
    }

    const logInfo = message => context.log(message)
    const logError = message => context.log.error(message)
    const logWarn = message => context.log.warn(message)

    // Call the unified handler
    await handleRequest({
        req,
        createResponse,
        logInfo,
        logError,
        logWarn,
    })
}

// Handle OPTIONS request (CORS preflight)
function handleOptionsRequest(context, headers) {
    context.log.info('Handling OPTIONS request (CORS preflight)')
    return createResponse(context, 200, headers, {})
}

// Handle GET request (health check)
function handleGetRequest(context, headers) {
    context.log.info('Handling GET request (health check)')
    return createResponse(context, 200, headers, {
        message:
            'askGPT is alive! Use POST with a JSON body containing a "question" field.',
        version: '1.1.0',
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        openAiInitError: openAiInitError, // Will be null if no initialization errors occurred
    })
}

// Handle POST request (main functionality)
async function handlePostRequest(context, req, headers) {
    context.log.info('Handling POST request for question')

    // Validate input
    if (
        !req.body ||
        typeof req.body.question !== 'string' ||
        req.body.question.trim() === ''
    ) {
        context.log.warn('Invalid request: Missing or empty question')
        return createResponse(context, 400, headers, {
            error: 'Missing or invalid question parameter. Please provide a non-empty question string.',
        })
    }

    // Get and sanitize the question
    const userQuestion = sanitizeInput(req.body.question.trim())
    context.log.info(
        `Question: "${userQuestion.substring(0, 50)}${
            userQuestion.length > 50 ? '...' : ''
        }"`
    )

  // Determine which feature is making the request
  let feature = 'default';
  // Check request URL path or body to identify feature
  if (req.url && req.url.includes('/projects')) {
    feature = 'projects';
  } else {
    // Try to detect from the question content
    const questionLower = req.body.question.toLowerCase();
    if (questionLower.includes('project') || questionLower.includes('portfolio')) {
      feature = 'projects';
    }
  }
  
  context.log.info(`Request detected as feature: ${feature}`);
  
  // Rate limiting check with feature-specific bucket
  const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown'
  if (isRateLimited(clientIp, feature)) {
    context.log.warn(`Rate limit exceeded for IP: ${clientIp} on feature: ${feature}`)
    return createResponse(context, 429, headers, {
      error: 'Too many requests. Please try again later.',
      feature: feature,
      recommendedWait: '10 seconds'
    })
  }

    // Extract configuration from request or use defaults
    const modelName =
        req.body.model && isValidModel(req.body.model)
            ? req.body.model
            : 'gpt-3.5-turbo'

    const temperature =
        req.body.temperature !== undefined &&
        req.body.temperature >= 0 &&
        req.body.temperature <= 1
            ? req.body.temperature
            : 0.7

    const maxTokens =
        req.body.maxTokens &&
        req.body.maxTokens > 0 &&
        req.body.maxTokens <= 4000
            ? req.body.maxTokens
            : 500

    context.log.info(
        `Using model: ${modelName}, temperature: ${temperature}, maxTokens: ${maxTokens}`
    )

    // Check cache for identical questions (with same parameters)
    const cacheKey = `${userQuestion}|${modelName}|${temperature}|${maxTokens}`
    const cachedResponse = checkCache(cacheKey)
    if (cachedResponse) {
        context.log.info(`Cache hit for question (${context.invocationId})`)
        return createResponse(context, 200, headers, {
            answer: cachedResponse,
            cached: true,
        })
    }

    // Get API key from config
    const apiKey = config.openAiApiKey

    // Check if API key is provided
    if (!apiKey || apiKey === 'your-api-key-here') {
        const errorMsg =
            'Missing OpenAI API key. Returning development mode response.'
        context.log.warn(errorMsg)

        // For development, return a mock response if no API key is available
        return createResponse(context, 200, headers, {
            answer: `[DEVELOPMENT MODE] OpenAI API key not configured. Your question was: "${userQuestion}"`,
            note: 'To use the real GPT model, set your OPENAI_API_KEY in Application Settings.',
            debug: {
                environment: process.env.NODE_ENV || 'not set',
                hasApiKey: !!apiKey,
                apiKeyIsDefault: apiKey === 'your-api-key-here',
                error: errorMsg,
            },
        })
    }

    // Use the pre-initialized OpenAI client or try to initialize again if needed
    let openai = openAiClient

    // If the global client initialization failed, try again
    if (!openai && apiKey) {
        try {
            context.log.info('Attempting to initialize OpenAI client')
            openai = new OpenAI({ apiKey })
            context.log.info(
                'OpenAI client initialized successfully during request'
            )
        } catch (error) {
            const errorMsg = `Failed to initialize OpenAI client: ${error.message}`
            context.log.error(errorMsg)
            return createResponse(context, 500, headers, {
                error: 'Failed to initialize OpenAI API client',
                message: errorMsg,
                details: {
                    apiKeyLength: apiKey ? apiKey.length : 0,
                    environment: process.env.NODE_ENV || 'not set',
                    openAiVersion: require('openai/package.json').version,
                    nodeVersion: process.version,
                },
            })
        }
    } else if (!openai) {
        const errorMsg = 'OpenAI API key is missing or invalid'
        context.log.error(errorMsg)
        return createResponse(context, 500, headers, {
            error: errorMsg,
            apiKeyStatus: apiKey ? 'present but may be invalid' : 'missing',
            details: {
                environment: process.env.NODE_ENV || 'not set',
            },
        })
    }

    try {
        // Enhance the question with GitHub repository documentation if available
        context.log.info('Checking for GitHub repository documentation')
        const enhancedQuestion = await enhanceWithRepositoryContent(userQuestion, {
            info: context.log.info || context.log,
            error: context.log.error || context.log.error
        })
        
        const hasRepoContent = enhancedQuestion !== userQuestion
        if (hasRepoContent) {
            context.log.info('Enhanced question with GitHub repository documentation')
        } else {
            context.log.info('No GitHub repository documentation was added')
        }
        
        // Call the OpenAI API with configurable parameters and enhanced error handling
        context.log.info(`Calling OpenAI API with model ${modelName}`)

        const startTime = Date.now()
        let response

        try {
            response = await openai.chat.completions.create({
                model: modelName,
                messages: [
                    {
                        role: 'system',
                        content:
                            "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors about specific projects. " +
                            "Use the provided project context and GitHub repository documentation to give accurate, concise, and informative responses. " +
                            "When repository documentation is available, prioritize this information as it's the most authoritative source. " +
                            "Focus on technical details and implementation choices when asked about them. " +
                            "When discussing challenges, emphasize both the problems faced and how they were solved. " +
                            "Always reference the GitHub repository when it's provided in your answers. " +
                            "Keep responses friendly and professional, tailored specifically to the project being discussed.",
                    },
                    {
                        role: 'user',
                        content: enhancedQuestion,
                    },
                ],
                max_tokens: maxTokens,
                temperature: temperature,
            })
        } catch (error) {
            // Detailed error logging for OpenAI API errors
            context.log.error(`OpenAI API error: ${error.message}`)
            context.log.error(
                `Error details: ${JSON.stringify(error, null, 2)}`
            )

            // Categorize common OpenAI errors
            if (error.status === 401) {
                throw new Error(
                    `Authentication error: Invalid API key. Original message: ${error.message}`
                )
            } else if (error.status === 429) {
                throw new Error(
                    `Rate limit exceeded. Original message: ${error.message}`
                )
            } else if (error.status === 500) {
                throw new Error(
                    `OpenAI server error. Original message: ${error.message}`
                )
            } else if (error.status === 400) {
                throw new Error(
                    `Invalid request to OpenAI API. Original message: ${error.message}`
                )
            } else if (
                error.name === 'TimeoutError' ||
                (error.message && error.message.includes('timeout'))
            ) {
                throw new Error(
                    `OpenAI API request timed out. Original message: ${error.message}`
                )
            } else {
                throw new Error(
                    `Unexpected error from OpenAI API: ${
                        error.message
                    }. Error type: ${error.name || 'unknown'}`
                )
            }
        }

        const apiCallDuration = Date.now() - startTime
        context.log.info(
            `Received successful response from OpenAI API in ${apiCallDuration}ms`
        )

        // Get the response text
        const answer = response.choices[0].message.content

        // Store in cache
        cacheResponse(cacheKey, answer)

        // Return the answer
        return createResponse(context, 200, headers, {
            answer,
            metrics: {
                apiCallDurationMs: apiCallDuration,
            },
        })
    } catch (error) {
        // Handle specific OpenAI API errors
        context.log.error(`Error calling OpenAI: ${error.message}`)

        if (error.status === 429) {
            return createResponse(context, 429, headers, {
                error: 'OpenAI rate limit exceeded. Please try again later.',
                message: error.message,
            })
        }

        if (error.status === 400) {
            return createResponse(context, 400, headers, {
                error: 'Invalid request to OpenAI API. Your question may be too long.',
                message: error.message,
            })
        }

        if (error.status === 401) {
            return createResponse(context, 401, headers, {
                error: 'Authentication error with OpenAI API. Please check your API key.',
                message: error.message,
                debug:
                    process.env.NODE_ENV === 'development'
                        ? {
                              apiKeyLength: apiKey ? apiKey.length : 0,
                          }
                        : undefined,
            })
        }

        // Re-throw for general handler
        throw error
    }
}

// Helper function to create consistent response objects
function createResponse(context, status, headers, body) {
    context.res = {
        status,
        headers,
        body,
    }
    return context.res
}

// Basic input sanitization
function sanitizeInput(input) {
    // Remove any HTML/script tags
    return input.replace(/<[^>]*>?/gm, '')
}

/**
 * Extracts GitHub repository URLs from text
 * @param {string} text - Text that may contain GitHub URLs
 * @returns {string[]} Array of GitHub repository URLs found
 */
function extractGitHubUrls(text) {
    if (!text) return [];
    const matches = text.match(GITHUB_URL_PATTERN);
    return matches || [];
}

/**
 * Enhances user question with repository documentation if available
 * @param {string} question - Original user question
 * @param {object} logFunctions - Object with logging functions
 * @returns {Promise<string>} Enhanced question with repository content
 */
async function enhanceWithRepositoryContent(question, logFunctions = { info: console.log, error: console.error }) {
    try {
        // Extract GitHub URLs from the question
        const githubUrls = extractGitHubUrls(question);
        
        if (githubUrls.length === 0) {
            logFunctions.info('No GitHub URLs found in the question');
            return question;
        }
        
        logFunctions.info(`Found ${githubUrls.length} GitHub URLs in the question`);
        
        // For each GitHub URL, fetch the repository documentation
        let repoContent = '';
        let repoCount = 0;
        
        for (const url of githubUrls) {
            try {
                logFunctions.info(`Fetching documentation for ${url}`);
                const docs = await githubUtils.fetchRepositoryDocs(url, logFunctions.error);
                
                if (docs && docs.length > 100) { // Ensure we got meaningful content
                    // Extract relevant content based on the question
                    const relevantDocs = githubUtils.extractRelevantContent(docs, question);
                    repoContent += `\n\n${relevantDocs}`;
                    repoCount++;
                }
            } catch (err) {
                logFunctions.error(`Error fetching repo content for ${url}: ${err.message}`);
                // Continue with other URLs if one fails
            }
        }
        
        if (repoCount > 0) {
            logFunctions.info(`Successfully added documentation from ${repoCount} repositories`);
            return `${question}\n\nREPOSITORY DOCUMENTATION:\n${repoContent}`;
        } else {
            logFunctions.info('No repository content could be fetched');
            return question;
        }
    } catch (error) {
        logFunctions.error(`Error enhancing question with repo content: ${error.message}`);
        return question; // Return original question if enhancement fails
    }
}

// Generate a correlation ID for request tracing
function generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}

// Simple validation of model names
function isValidModel(model) {
    const allowedModels = [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-3.5-turbo-16k',
    ]
    return allowedModels.includes(model)
}

// Use the isRateLimited function from unified-server
// This is now imported at the top level and used in the handlePostRequest function

// Cache helpers
function checkCache(key) {
    const cached = responseCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }
    return null
}

function cacheResponse(key, data) {
    responseCache.set(key, {
        timestamp: Date.now(),
        data,
    })

    // Clean up old cache entries
    if (responseCache.size > 1000) {
        // Prevent unbounded growth
        const now = Date.now()
        for (const [k, v] of responseCache.entries()) {
            if (now - v.timestamp > CACHE_TTL) {
                responseCache.delete(k)
            }
        }
    }
}
