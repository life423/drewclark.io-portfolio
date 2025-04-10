/**
 * Unified Server Handler
 * 
 * This module provides a unified request handling interface that works across
 * different environments (Express.js server and Azure Functions).
 * 
 * This is a thin wrapper around the modular request handler implementation.
 */

const { handleRequest } = require('./services/handlers/requestHandler');

// Export the handler function
module.exports = {
  handleRequest
};
