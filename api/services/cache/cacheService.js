/**
 * Cache Service
 * 
 * Provides a configurable LRU cache implementation with size limits and TTL.
 * Used for caching API responses to improve performance and reduce API costs.
 */

const config = require('../../config');

/**
 * Enhanced LRU cache implementation with size limits
 * This prevents memory leaks by limiting both the number of entries and
 * performing periodic cleanup of expired items
 */
class LRUCache {
  constructor(maxSize = 1000, ttl = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.lastCleanup = Date.now();
    this.cleanupInterval = 60000; // Cleanup every minute
  }

  get(key) {
    this.maybeCleanup();
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update timestamp to mark as recently used
    item.timestamp = Date.now();
    
    // Move to the end to maintain LRU order
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }

  set(key, data) {
    this.maybeCleanup();
    
    // Enforce size limit by removing least recently used items
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    });
  }

  // Cleanup expired items when needed
  maybeCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.lastCleanup = now;
      
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.ttl) {
          this.cache.delete(key);
        }
      }
    }
  }
  
  // Clear the entire cache
  clear() {
    this.cache.clear();
  }
  
  // Get cache stats for monitoring
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttl
    };
  }
}

// Create singleton cache instance
const responseCache = new LRUCache(
  config.cacheMaxSize || 1000, 
  config.cacheTtlMs || 3600000 // 1 hour default
);

/**
 * Check if a response is available in cache
 * @param {string} key - Cache key
 * @returns {any} Cached data or null if not found
 */
function checkCache(key) {
  return responseCache.get(key);
}

/**
 * Store a response in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
function cacheResponse(key, data) {
  responseCache.set(key, data);
}

/**
 * Generate a standardized cache key from request parameters
 * @param {string} question - User question
 * @param {string} model - Model name
 * @param {number} temperature - Temperature parameter
 * @param {number} maxTokens - Max tokens parameter
 * @param {string} repositoryUrl - Optional repository URL
 * @returns {string} Cache key
 */
function generateCacheKey(question, model, temperature, maxTokens, repositoryUrl = '') {
  return `${question}|${model}|${temperature}|${maxTokens}|${repositoryUrl}`;
}

module.exports = {
  checkCache,
  cacheResponse,
  generateCacheKey,
  responseCache
};
