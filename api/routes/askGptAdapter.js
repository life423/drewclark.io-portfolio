/**
 * AskGPT API Route Adapter
 * 
 * This adapter connects Express.js routes to the unified request handler,
 * ensuring compatibility with the new modular architecture.
 */

const { handleRequest } = require('../services/handlers/requestHandler');

/**
 * Create Express middleware to process AI chat requests
 * @param {string} feature - Feature identifier (default, projects)
 * @returns {Function} Express middleware
 */
function createAskGptHandler(feature = 'default') {
  return async (req, res) => {
    // Wrap Express request and response in the format expected by unified handler
    const createResponse = (statusCode, headers, body) => {
      // Apply headers
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Send response
      return res.status(statusCode).json(body);
    };
    
    // Add feature identifier to request
    req.feature = feature;
    
    // Logging functions using Express methods
    const logInfo = message => console.log(`[${feature}] ${message}`);
    const logError = message => console.error(`[${feature}] ${message}`);
    const logWarn = message => console.warn(`[${feature}] ${message}`);
    
    try {
      // Process the request through the unified handler
      await handleRequest({ 
        req, 
        createResponse, 
        logInfo, 
        logError, 
        logWarn 
      });
    } catch (error) {
      // Ensure uncaught errors are properly handled
      console.error(`Unhandled error in askGPT ${feature} handler:`, error);
      res.status(500).json({
        error: 'An unexpected error occurred',
        message: 'The server encountered an error while processing your request'
      });
    }
  };
}

// Export handlers for different features
module.exports = {
  defaultHandler: createAskGptHandler('default'),
  projectsHandler: createAskGptHandler('projects')
};
