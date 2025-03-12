const { OpenAI } = require('openai')
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development'
});

// Simple in-memory cache (consider using a distributed cache in production)
const responseCache = new Map()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

module.exports = async function (context, req) {
    // Log function invocation with correlation ID for tracing
    const correlationId =
        req.headers['x-correlation-id'] || generateCorrelationId()
    context.log.info(`askGPT function invoked. CorrelationId: ${correlationId}`)

    // Set response headers for CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers':
            'Content-Type, Authorization, X-Correlation-Id',
        'X-Correlation-Id': correlationId,
    }

    try {
        // Handle different HTTP methods
        switch (req.method) {
            case 'OPTIONS':
                return handleOptionsRequest(context, headers)
            case 'GET':
                return handleGetRequest(context, headers)
            case 'POST':
                return await handlePostRequest(context, req, headers)
            default:
                return createResponse(context, 405, headers, {
                    error: 'Method not allowed. Use POST to ask a question.',
                })
        }
    } catch (error) {
        // Log the error with correlation ID for easier debugging
        context.log.error(
            `Error processing request (${correlationId}): ${error.message}`
        )
        context.log.error(error)

        // Determine the appropriate error message based on environment
        const errorMessage =
            process.env.NODE_ENV === 'development'
                ? error.message
                : 'Please try again later.'

        // Return a friendly error response
        return createResponse(context, 500, headers, {
            error: 'An error occurred while processing your request.',
            message: errorMessage,
            correlationId,
        })
    }
}

// Handle OPTIONS request (CORS preflight)
function handleOptionsRequest(context, headers) {
    return createResponse(context, 200, headers, {})
}

// Handle GET request (health check)
function handleGetRequest(context, headers) {
    return createResponse(context, 200, headers, {
        message:
            'askGPT is alive! Use POST with a JSON body containing a "question" field.',
        version: '1.1.0',
    })
}

// Handle POST request (main functionality)
async function handlePostRequest(context, req, headers) {
    // Validate input
    if (
        !req.body ||
        typeof req.body.question !== 'string' ||
        req.body.question.trim() === ''
    ) {
        return createResponse(context, 400, headers, {
            error: 'Missing or invalid question parameter. Please provide a non-empty question string.',
        })
    }

    // Get and sanitize the question
    const userQuestion = sanitizeInput(req.body.question.trim())

    // Rate limiting check (implement more robust solution in production)
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown'
    if (isRateLimited(clientIp)) {
        return createResponse(context, 429, headers, {
            error: 'Too many requests. Please try again later.',
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

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY

    // Check if API key is provided
    if (!apiKey || apiKey === 'your-api-key-here') {
        context.log.warn(
            'Missing OpenAI API key. Returning development mode response.'
        )

        // For development, return a mock response if no API key is available
        return createResponse(context, 200, headers, {
            answer: `[DEVELOPMENT MODE] OpenAI API key not configured. Your question was: "${userQuestion}"`,
            note: 'To use the real GPT model, set your OPENAI_API_KEY in Application Settings.',
        })
    }

    // Initialize the OpenAI client
    const openai = new OpenAI({ apiKey })

    try {
        // Call the OpenAI API with configurable parameters
        const response = await openai.chat.completions.create({
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
        })

        // Get the response text
        const answer = response.choices[0].message.content

        // Store in cache
        cacheResponse(cacheKey, answer)

        // Return the answer
        return createResponse(context, 200, headers, { answer })
    } catch (error) {
        // Handle specific OpenAI API errors
        if (error.status === 429) {
            return createResponse(context, 429, headers, {
                error: 'OpenAI rate limit exceeded. Please try again later.',
            })
        }

        if (error.status === 400) {
            return createResponse(context, 400, headers, {
                error: 'Invalid request to OpenAI API. Your question may be too long.',
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

// Simple in-memory rate limiting
const rateLimitMap = new Map()
function isRateLimited(clientIp) {
    const now = Date.now()
    const limit = 10 // 10 requests
    const window = 60000 // per minute

    // Initialize or update rate limit tracking
    if (!rateLimitMap.has(clientIp)) {
        rateLimitMap.set(clientIp, [])
    }

    // Get request history and filter out old requests
    let requests = rateLimitMap.get(clientIp)
    requests = requests.filter(timestamp => now - timestamp < window)

    // Check if limit is exceeded
    if (requests.length >= limit) {
        return true // Rate limited

    }

    // Record this request
    requests.push(now)
    rateLimitMap.set(clientIp, requests)

    return false // Not rate limited
}

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
