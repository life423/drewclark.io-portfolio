/**
 * API Test Function
 * 
 * This function is used for diagnosing issues with the API environment.
 * It returns information about the request, environment variables,
 * and other diagnostic data without any external dependencies.
 */

module.exports = async function (context, req) {
    // Capture start time for performance metrics
    const startTime = Date.now();
    
    // Generate a correlation ID for request tracing
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Set response headers
    const headers = {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    try {
        // Handle OPTIONS requests (CORS preflight)
        if (req.method === 'OPTIONS') {
            return createResponse(context, 200, headers, {
                message: 'CORS preflight successful'
            });
        }
        
        // Safely get environment variables (redacting sensitive values)
        const envVars = getEnvironmentVariables();
        
        // Get request details (without exposing sensitive data)
        const requestInfo = {
            method: req.method,
            url: req.url,
            headers: safelyRedactHeaders(req.headers),
            query: req.query,
            bodySize: req.body ? JSON.stringify(req.body).length : 0
        };
        
        // Check for specific Azure environment information
        const azureInfo = {
            isFunctionApp: !!process.env.FUNCTIONS_WORKER_RUNTIME,
            isStaticWebApp: !!process.env.StaticWebAppsAuthCookie,
            region: process.env.REGION_NAME || 'unknown',
            functionVersion: process.env.FUNCTIONS_EXTENSION_VERSION || 'unknown'
        };
        
        // Calculate execution time
        const executionTime = Date.now() - startTime;
        
        // Return complete diagnostic information
        return createResponse(context, 200, headers, {
            message: 'API Test function executed successfully',
            timestamp: new Date().toISOString(),
            correlationId,
            executionTimeMs: executionTime,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'unknown',
            request: requestInfo,
            envVars,
            azure: azureInfo
        });
        
    } catch (error) {
        // Log error with correlation ID
        context.log.error(`[${correlationId}] Error in apiTest function: ${error.message}`);
        
        // Include stack trace in development environment
        const errorDetails = process.env.NODE_ENV !== 'production' ? {
            stack: error.stack,
            name: error.name
        } : {
            message: 'Error details omitted in production'
        };
        
        // Return error response
        return createResponse(context, 500, headers, {
            error: 'An error occurred while executing the test function',
            message: error.message,
            correlationId,
            details: errorDetails
        });
    }
};

/**
 * Safely gets environment variables with sensitive values redacted
 */
function getEnvironmentVariables() {
    const result = {};
    
    // List of environment variables to include
    const envVarsToInclude = [
        'NODE_ENV',
        'FUNCTIONS_WORKER_RUNTIME',
        'WEBSITE_HOSTNAME',
        'WEBSITE_INSTANCE_ID',
        'REGION_NAME'
    ];
    
    // Add environment variables to the result
    for (const varName of envVarsToInclude) {
        result[varName] = process.env[varName] || 'not set';
    }
    
    // Check for specific sensitive variables (redact actual values)
    const sensitiveVars = [
        'OPENAI_API_KEY',
        'STORAGE_KEY',
        'STORAGE_ACCOUNT'
    ];
    
    // Add redacted versions of sensitive variables
    for (const varName of sensitiveVars) {
        if (process.env[varName]) {
            result[varName] = `[REDACTED] (${process.env[varName].length} characters)`;
        } else {
            result[varName] = 'not set';
        }
    }
    
    return result;
}

/**
 * Creates a consistent response object
 */
function createResponse(context, status, headers, body) {
    context.res = {
        status,
        headers,
        body
    };
    return context.res;
}

/**
 * Safely redacts sensitive information from headers
 */
function safelyRedactHeaders(headers) {
    const redactedHeaders = { ...headers };
    
    // List of headers that might contain sensitive information
    const sensitiveHeaders = [
        'authorization',
        'x-api-key',
        'x-functions-key',
        'cookie'
    ];
    
    // Redact sensitive headers
    for (const header of sensitiveHeaders) {
        if (redactedHeaders[header]) {
            redactedHeaders[header] = '[REDACTED]';
        }
    }
    
    return redactedHeaders;
}
