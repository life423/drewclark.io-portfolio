/**
 * Shared API Service
 * 
 * A centralized service for managing API requests across different features
 * to prevent rate limiting conflicts and ensure fair resource allocation.
 */

// Request priorities
export const PRIORITY = {
  HIGH: 'high',     // User-initiated actions (card questions)
  MEDIUM: 'medium', // Interactive features (Connect4 game)
  LOW: 'low'        // Background tasks
};

// Request categories for separate rate limiting
export const CATEGORY = {
  PROJECT_CARDS: 'project_cards',
  OTHER: 'other'
};

class SharedApiService {
  constructor() {
    // Separate queues per category to prevent feature starvation
    this.requestQueues = {
      [CATEGORY.PROJECT_CARDS]: [],
      [CATEGORY.OTHER]: []
    };
    
    // Separate rate limits per category
    this.rateLimits = {
      [CATEGORY.PROJECT_CARDS]: { count: 0, lastReset: Date.now(), maxPerMinute: 10 },
      [CATEGORY.OTHER]: { count: 0, lastReset: Date.now(), maxPerMinute: 5 }
    };
    
    // Track in-flight requests
    this.pendingRequests = new Map();
    
    // Start queue processor
    this.processQueues();
  }
  
  /**
   * Add a request to the appropriate queue with improved error handling and logging
   * @param {Object} options - Request options
   * @param {string} [options.endpoint='/api/askGPT'] - API endpoint
   * @param {string} [options.method='POST'] - HTTP method
   * @param {Object} options.body - Request body
   * @param {string} [options.category=CATEGORY.OTHER] - Request category
   * @param {string} [options.priority=PRIORITY.MEDIUM] - Request priority
   * @param {AbortSignal} [options.signal] - AbortController signal
   * @param {Function} [options.onProgress] - Progress callback (for streaming responses)
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @returns {Promise<Object>} - Promise resolving to the API response
   */
  async enqueueRequest(options) {
    const {
      endpoint = '/api/askGPT',
      method = 'POST',
      body,
      category = CATEGORY.OTHER,
      priority = PRIORITY.MEDIUM,
      signal, // AbortController signal
      onProgress,
      timeout = 30000 // Default 30s timeout
    } = options;
    
    // Debug deployment environment
    console.log(`API Request Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Endpoint: ${endpoint}`);
    
    return new Promise((resolve, reject) => {
      try {
        // Generate a request ID with better uniqueness
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        
        // Validate inputs
        if (!body) {
          throw new Error('Request body is required');
        }
        
        if (!Object.values(CATEGORY).includes(category)) {
          console.warn(`Unknown category: ${category}, falling back to OTHER`);
        }
        
        if (!Object.values(PRIORITY).includes(priority)) {
          console.warn(`Unknown priority: ${priority}, falling back to MEDIUM`);
        }
        
        // Create the request object with additional metadata
        const request = {
          id: requestId,
          endpoint,
          method,
          body,
          priority,
          createdAt: Date.now(),
          resolve,
          reject,
          signal,
          onProgress,
          timeout,
          retryCount: 0, // For tracking retries
          category // Store category for logging
        };
        
        // Get the appropriate queue
        const queue = this.requestQueues[
          Object.values(CATEGORY).includes(category) ? category : CATEGORY.OTHER
        ];
        
        // Add to queue, sorting by priority then creation time
        queue.push(request);
        queue.sort((a, b) => {
          // First by priority
          if (a.priority !== b.priority) {
            return a.priority === PRIORITY.HIGH ? -1 : 
                   b.priority === PRIORITY.HIGH ? 1 : 
                   a.priority === PRIORITY.MEDIUM ? -1 : 1;
          }
          // Then by creation time (oldest first)
          return a.createdAt - b.createdAt;
        });
        
        console.log(`Request queued: ${requestId} (Category: ${category}, Priority: ${priority})`);
        
        // Set timeout to reject if request takes too long in queue
        const timeoutId = setTimeout(() => {
          // Only reject if still in queue (not picked up for processing)
          const queueIndex = queue.findIndex(req => req.id === requestId);
          if (queueIndex !== -1) {
            console.warn(`Request ${requestId} timed out in queue after ${timeout}ms`);
            queue.splice(queueIndex, 1);
            reject(new Error(`Request timed out after ${timeout}ms waiting in queue`));
          }
        }, timeout);
        
        // Store the timeout ID for cleanup
        request.queueTimeoutId = timeoutId;
      } catch (error) {
        console.error('Error enqueueing request:', error);
        reject(error);
      }
    });
  }
  
  // Process all queues round-robin style
  async processQueues() {
    const categories = Object.values(CATEGORY);
    let categoryIndex = 0;
    let isProcessing = false;
    
    // Logging for debugging
    console.log("Starting queue processor");
    
    // Clean up queue automatically every 10 seconds
    this.cleanupInterval = setInterval(() => this.cleanupQueues(), 10000);
    
    const processNext = async () => {
      // Avoid concurrent processing
      if (isProcessing) {
        setTimeout(processNext, 50);
        return;
      }
      
      isProcessing = true;
      
      try {
        // Get next category in round-robin fashion
        const category = categories[categoryIndex];
        categoryIndex = (categoryIndex + 1) % categories.length;
        
        // Log queue sizes periodically, but only if they're non-empty to reduce noise
        if (categoryIndex === 0) {
          const queueInfo = Object.entries(this.requestQueues).map(
            ([cat, queue]) => `${cat}: ${queue.length}`
          ).join(', ');
          
          // Only log if at least one queue has items
          if (Object.values(this.requestQueues).some(queue => queue.length > 0)) {
            console.log("Queue sizes:", queueInfo);
            
            // Add warning if queues are getting large
            const totalQueueSize = Object.values(this.requestQueues)
              .reduce((sum, queue) => sum + queue.length, 0);
            
            if (totalQueueSize > 20) {
              console.warn(`Large queue size detected (${totalQueueSize} items). Performing emergency cleanup.`);
              this.cleanupQueues(true); // Force aggressive cleanup
            }
          }
        }
        
        // Check rate limits
        this.updateRateLimits(category);
        if (this.isRateLimited(category)) {
          console.log(`Rate limit for ${category} reached, skipping`);
          setTimeout(processNext, 100);
          isProcessing = false;
          return;
        }
        
        // Get next request from this category's queue
        const queue = this.requestQueues[category];
        if (queue.length === 0) {
          setTimeout(processNext, 50);
          isProcessing = false;
          return;
        }
        
        // Get the next request without removing it yet
        const request = queue[0];
        
        // Check if request is too old (5 minutes max wait time)
        const now = Date.now();
        if (now - request.createdAt > 300000) {
          console.warn(`Request ${request.id} is too old (${Math.round((now - request.createdAt)/1000)}s), removing from queue`);
          queue.shift(); // Remove it
          request.reject(new Error('Request expired in queue'));
          setTimeout(processNext, 50);
          isProcessing = false;
          return;
        }
        
        // Check if request was cancelled
        if (request.signal && request.signal.aborted) {
          console.log(`Request ${request.id} was cancelled, removing from queue`);
          queue.shift(); // Now remove it from the queue
          setTimeout(processNext, 50);
          isProcessing = false;
          return;
        }
        
        console.log(`Processing request ${request.id} from ${category} queue`);
        
        try {
          // Track in-flight request
          this.pendingRequests.set(request.id, request);
          
          // Remove from queue
          queue.shift();
          
          // Increment rate limit counter
          this.rateLimits[category].count++;
          
          // Add request start time for debugging
          const requestStartTime = Date.now();
          console.log(`Starting API request to ${request.endpoint} at ${new Date(requestStartTime).toISOString()}`);
          
          // Make the request with detailed error handling
          const response = await fetch(request.endpoint, {
            method: request.method,
            headers: { 
              'Content-Type': 'application/json',
              'X-API-Feature': category, // Useful if backend implements feature-based rate limiting
              'X-Request-ID': request.id // For tracing in server logs
            },
            body: JSON.stringify(request.body),
            signal: request.signal
          });
          
          // Log response details for debugging
          const requestDuration = Date.now() - requestStartTime;
          console.log(`Response received for ${request.id} in ${requestDuration}ms, status: ${response.status}`);
          
          if (!response.ok) {
            // Log more details about error responses
            const errorText = await response.text().catch(e => 'Unable to get response text');
            console.error(`API error response details for ${request.id}:`, {
              status: response.status,
              statusText: response.statusText,
              responseText: errorText.substring(0, 500) // Limit the size for logging
            });
            throw new Error(`API error: ${response.status} - ${response.statusText || 'Unknown error'}`);
          }
          
          try {
            const data = await response.json();
            console.log(`Request ${request.id} completed successfully`);
            request.resolve(data);
          } catch (jsonError) {
            console.error(`JSON parsing error for ${request.id}:`, jsonError);
            throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
          }
        } catch (error) {
          console.log(`Request ${request.id} failed: ${error.message}`);
          
          // Only reject if not aborted
          if (error.name !== 'AbortError') {
            request.reject(error);
          } else {
            console.log(`Request ${request.id} was aborted during processing`);
          }
        } finally {
          this.pendingRequests.delete(request.id);
          
          // Continue processing
          setTimeout(processNext, 50);
          isProcessing = false;
        }
      } catch (unexpectedError) {
        // Catch any unexpected errors in the processNext function itself
        console.error("Unexpected error in queue processor:", unexpectedError);
        setTimeout(processNext, 100); // Still try to continue
        isProcessing = false;
      }
    };
    
    // Start the processor
    processNext();
  }
  
  updateRateLimits(category) {
    const now = Date.now();
    const limit = this.rateLimits[category];
    
    // Reset counters if a minute has passed
    if (now - limit.lastReset > 60000) {
      limit.count = 0;
      limit.lastReset = now;
    }
  }
  
  isRateLimited(category) {
    const limit = this.rateLimits[category];
    return limit.count >= limit.maxPerMinute;
  }
  
  /**
   * Clean up the request queues by removing expired or stale requests
   * @param {boolean} [aggressive=false] - Whether to perform aggressive cleanup (for emergency situations)
   */
  cleanupQueues(aggressive = false) {
    const now = Date.now();
    const maxAge = aggressive ? 10000 : 60000; // 10 seconds in aggressive mode, 1 minute otherwise
    let cleanedCount = 0;
    
    // Go through each category queue
    Object.keys(this.requestQueues).forEach(category => {
      const queue = this.requestQueues[category];
      const initialLength = queue.length;
      
      // Remove old requests
      this.requestQueues[category] = queue.filter(request => {
        const age = now - request.createdAt;
        const isExpired = age > maxAge;
        
        if (isExpired) {
          // Clear the timeout to prevent memory leaks
          if (request.queueTimeoutId) {
            clearTimeout(request.queueTimeoutId);
          }
          
          // Reject the request with appropriate message
          request.reject(new Error(`Request expired after ${Math.round(age/1000)}s in queue during cleanup`));
          cleanedCount++;
          return false;
        }
        
        return true;
      });
    });
    
    // Only log if we actually cleaned something
    if (cleanedCount > 0) {
      console.log(`Queue cleanup: removed ${cleanedCount} expired requests`);
    }
  }
  
  // Cancel a specific request if needed
  cancelRequest(category, requestId) {
    // Remove from queue if still waiting
    this.requestQueues[category] = this.requestQueues[category]
      .filter(req => req.id !== requestId);
      
    // If in-flight and has an abort controller, abort it
    const pendingRequest = this.pendingRequests.get(requestId);
    if (pendingRequest && pendingRequest.signal) {
      const controller = pendingRequest.signal.controller;
      if (controller) controller.abort();
    }
  }
}

// Singleton instance
export const sharedApiService = new SharedApiService();
