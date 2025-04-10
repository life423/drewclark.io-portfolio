/**
 * Rate Limit Service
 * 
 * Provides rate limiting functionality to prevent abuse
 * and ensure fair resource allocation.
 */

const config = require('../../config');

// In-memory store for rate limiting
const rateLimitMap = new Map();

/**
 * Check if a request is rate limited
 * @param {string} clientIp - Client IP address
 * @param {string} feature - Feature identifier (connect4, projects, default, etc.)
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
  
  // Update global request history (filter out expired timestamps)
  let globalRequests = clientData.global;
  globalRequests = globalRequests.filter(timestamp => now - timestamp < globalWindow);
  
  // Update feature-specific request history (filter out expired timestamps)
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

/**
 * Get rate limit information for a client
 * @param {string} clientIp - Client IP address
 * @param {string} feature - Feature identifier
 * @returns {Object} Rate limit information
 */
function getRateLimitInfo(clientIp, feature = 'default') {
  if (!rateLimitMap.has(clientIp)) {
    return {
      remaining: {
        global: config.rateLimitRequests,
        feature: config.featureRateLimits[feature]?.requests || config.rateLimitRequests
      },
      limit: {
        global: config.rateLimitRequests,
        feature: config.featureRateLimits[feature]?.requests || config.rateLimitRequests
      },
      resetIn: {
        global: config.rateLimitWindowMs,
        feature: config.featureRateLimits[feature]?.windowMs || config.rateLimitWindowMs
      }
    };
  }
  
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp);
  
  // Get global stats
  const globalLimit = config.rateLimitRequests;
  const globalWindow = config.rateLimitWindowMs;
  const globalRequests = clientData.global ? 
    clientData.global.filter(timestamp => now - timestamp < globalWindow) : 
    [];
  
  // Get feature stats
  const featureConfig = config.featureRateLimits[feature];
  const featureLimit = featureConfig ? featureConfig.requests : globalLimit;
  const featureWindow = featureConfig ? featureConfig.windowMs : globalWindow;
  const featureRequests = clientData[feature] ? 
    clientData[feature].filter(timestamp => now - timestamp < featureWindow) :
    [];
  
  return {
    remaining: {
      global: Math.max(0, globalLimit - globalRequests.length),
      feature: Math.max(0, featureLimit - featureRequests.length)
    },
    limit: {
      global: globalLimit,
      feature: featureLimit
    },
    resetIn: {
      global: globalRequests.length > 0 ? 
        Math.max(0, globalWindow - (now - Math.min(...globalRequests))) : 
        0,
      feature: featureRequests.length > 0 ? 
        Math.max(0, featureWindow - (now - Math.min(...featureRequests))) : 
        0
    }
  };
}

/**
 * Reset rate limit for a client (for testing or admin purposes)
 * @param {string} clientIp - Client IP address to reset
 */
function resetRateLimit(clientIp) {
  if (rateLimitMap.has(clientIp)) {
    rateLimitMap.delete(clientIp);
  }
}

module.exports = {
  isRateLimited,
  getRateLimitInfo,
  resetRateLimit
};
