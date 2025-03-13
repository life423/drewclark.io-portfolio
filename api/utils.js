/**
 * Utility functions for the API
 */

// Simple in-memory cache (consider using a distributed cache in production)
const responseCache = new Map();
let CACHE_TTL = 3600; // Default 1 hour, overridden by config if available

// Generate a correlation ID for request tracing
function generateCorrelationId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

// Basic input sanitization to remove HTML/script tags
function sanitizeInput(input) {
  return input.replace(/<[^>]*>?/gm, '');
}

// Simple in-memory rate limiting
const rateLimitMap = new Map();
function isRateLimited(clientIp, limit = 10, window = 60000) {
  const now = Date.now();
  
  // Initialize or update rate limit tracking
  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, []);
  }
  
  // Get request history and filter out old requests
  let requests = rateLimitMap.get(clientIp);
  requests = requests.filter(timestamp => now - timestamp < window);
  
  // Check if limit is exceeded
  if (requests.length >= limit) {
    return true; // Rate limited
  }
  
  // Record this request
  requests.push(now);
  rateLimitMap.set(clientIp, requests);
  
  return false; // Not rate limited
}

// Cache helpers
function checkCache(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function cacheResponse(key, data) {
  responseCache.set(key, {
    timestamp: Date.now(),
    data,
  });
  
  // Clean up old cache entries
  if (responseCache.size > 1000) {
    // Prevent unbounded growth
    const now = Date.now();
    for (const [k, v] of responseCache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        responseCache.delete(k);
      }
    }
  }
}

// Set cache TTL based on config
function setCacheTTL(ttl) {
  if (typeof ttl === 'number' && ttl > 0) {
    CACHE_TTL = ttl;
  }
}

module.exports = {
  generateCorrelationId,
  sanitizeInput,
  isRateLimited,
  checkCache,
  cacheResponse,
  setCacheTTL
};