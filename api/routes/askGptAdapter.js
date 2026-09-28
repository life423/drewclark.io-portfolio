/**
 * Express adapter for the chat request handler
 */
const { handleRequest } = require('../services/handlers/requestHandler');

async function askGptHandler(req, res) {
  const createResponse = (statusCode, headers, body) => {
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(statusCode).json(body);
  };
  const logInfo = message => console.log(`[chat] ${message}`);
  const logError = message => console.error(`[chat] ${message}`);
  const logWarn = message => console.warn(`[chat] ${message}`);

  try {
    await handleRequest({ req, createResponse, logInfo, logError, logWarn });
  } catch (error) {
    console.error('[chat] Unhandled error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
}

module.exports = { askGptHandler };
