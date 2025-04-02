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
  CONNECT4: 'connect4',
  PROJECT_CARDS: 'project_cards',
  OTHER: 'other'
};

class SharedApiService {
  constructor() {
    // Separate queues per category to prevent feature starvation
    this.requestQueues = {
      [CATEGORY.CONNECT4]: [],
      [CATEGORY.PROJECT_CARDS]: [],
      [CATEGORY.OTHER]: []
    };
    
    // Separate rate limits per category
    this.rateLimits = {
      [CATEGORY.CONNECT4]: { count: 0, lastReset: Date.now(), maxPerMinute: 6 },
      [CATEGORY.PROJECT_CARDS]: { count: 0, lastReset: Date.now(), maxPerMinute: 10 },
      [CATEGORY.OTHER]: { count: 0, lastReset: Date.now(), maxPerMinute: 5 }
    };
    
    // Track in-flight requests
    this.pendingRequests = new Map();
    
    // Start queue processor
    this.processQueues();
  }
  
  // Add a request to the appropriate queue
  async enqueueRequest(options) {
    const {
      endpoint = '/api/askGPT',
      method = 'POST',
      body,
      category = CATEGORY.OTHER,
      priority = PRIORITY.MEDIUM,
      signal, // AbortController signal
      onSuccess,
      onError
    } = options;
    
    return new Promise((resolve, reject) => {
      // Generate a simple request ID based on timestamp and random number
      const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Create the request object
      const request = {
        id: requestId,
        endpoint,
        method,
        body,
        priority,
        createdAt: Date.now(),
        resolve,
        reject,
        signal
      };
      
      // Add to appropriate queue, sorting by priority
      this.requestQueues[category].push(request);
      this.requestQueues[category].sort((a, b) => {
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
    });
  }
  
  // Process all queues round-robin style
  async processQueues() {
    const categories = Object.values(CATEGORY);
    let categoryIndex = 0;
    let isProcessing = false;
    
    // Logging for debugging
    console.log("Starting queue processor");
    
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
        
        // Log queue sizes periodically
        if (categoryIndex === 0) {
          console.log("Queue sizes:", Object.entries(this.requestQueues).map(
            ([cat, queue]) => `${cat}: ${queue.length}`
          ).join(', '));
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
          
          // Make the request
          const response = await fetch(request.endpoint, {
            method: request.method,
            headers: { 
              'Content-Type': 'application/json',
              'X-API-Feature': category // Useful if backend implements feature-based rate limiting
            },
            body: JSON.stringify(request.body),
            signal: request.signal
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`Request ${request.id} completed successfully`);
          request.resolve(data);
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
