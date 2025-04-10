/**
 * Repository Update Service
 * 
 * Handles background processing and updating of repositories.
 * This service ensures that repositories are automatically processed
 * and their code embeddings kept up to date without requiring
 * on-demand processing during chat requests.
 */
const { getKnownRepositories, updateKnownRepositories } = require('../repositories/repoDiscoveryService');
const { cloneOrUpdateRepository } = require('../repositories/repoCloneService');
const { parseRepository } = require('../codeProcessing/codeParserService');
const { chunkRepositoryUnits } = require('../codeProcessing/chunkingService');
const { processCodeChunksWithEmbeddings } = require('../embeddings/embeddingService');
const qdrantService = require('../vectorDb/qdrantService');
const config = require('../../config');

// Tracking for repository processing jobs
let isProcessing = false;
const activeJobs = new Map(); // Track currently running jobs
const jobQueue = [];         // Queue for pending jobs

// Load environment variables with defaults
const PROCESS_TIMEOUT_MS = parseInt(process.env.REPOSITORY_PROCESS_TIMEOUT_MS || '1800000', 10); // 30 minutes default
const CONCURRENT_PROCESSES = parseInt(process.env.REPOSITORY_CONCURRENT_PROCESSES || '2', 10);   // 2 concurrent jobs default
const UPDATE_INTERVAL_MS = parseInt(process.env.REPOSITORY_UPDATE_INTERVAL_MS || '3600000', 10); // 1 hour default
const MAX_BATCH_SIZE = parseInt(process.env.MAX_EMBEDDING_BATCH_SIZE || '50', 10);               // 50 chunks per batch default
const INCREMENTAL_PROCESSING = process.env.INCREMENTAL_PROCESSING !== 'false';                   // Default to true
const FAIL_FAST = process.env.FAIL_FAST_ON_ERRORS !== 'false';                                   // Default to true

/**
 * Create a promise that can be rejected after a timeout
 * @param {Promise} promise - The promise to add a timeout to
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} errorMessage - Error message if timeout occurs
 */
function withTimeout(promise, timeoutMs, errorMessage) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    promise.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

/**
 * Process a single repository through the entire pipeline
 * @param {string} repoUrl - GitHub repository URL
 */
async function processRepository(repoUrl) {
  // Add to active jobs map
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  activeJobs.set(jobId, { url: repoUrl, startTime: Date.now() });
  
  try {
    console.log(`\n=== Processing repository: ${repoUrl} (Job ID: ${jobId}) ===\n`);
    
    // Step 1: Clone or update the repository with timeout
    console.log(`1. Cloning/updating repository... (timeout: ${PROCESS_TIMEOUT_MS/60000} minutes)`);
    const repoInfo = await withTimeout(
      cloneOrUpdateRepository(repoUrl),
      PROCESS_TIMEOUT_MS,
      `Repository clone/update timed out after ${PROCESS_TIMEOUT_MS/60000} minutes`
    );
    console.log(`Repository cloned to: ${repoInfo.path}`);
    
    // Step 2: Parse the repository into semantic units
    console.log('\n2. Parsing repository...');
    const units = await withTimeout(
      parseRepository(repoInfo.path),
      PROCESS_TIMEOUT_MS,
      'Repository parsing timed out'
    );
    console.log(`Parsed ${units.length} code units from repository`);
    
    // Step 3: Chunk the units
    console.log('\n3. Chunking code units...');
    const chunks = await withTimeout(
      chunkRepositoryUnits(units),
      PROCESS_TIMEOUT_MS / 2,  // Less time needed for chunking
      'Code chunking timed out'
    );
    console.log(`Created ${chunks.length} chunks from ${units.length} units`);
    
    // Step 4: Initialize the vector database
    console.log('\n4. Initializing vector database...');
    await withTimeout(
      qdrantService.initialize(),
      60000,  // 1 minute timeout for DB initialization
      'Vector database initialization timed out'
    );
    console.log('Vector database initialized');
    
    // Step 5: Handle existing embeddings based on incremental setting
    console.log('\n5. Handling existing embeddings...');
    
    if (!INCREMENTAL_PROCESSING) {
      // Delete all existing embeddings for this repository if not in incremental mode
      await qdrantService.deleteByFilter(config.vectorDb.collections.codeEmbeddings, {
        owner: repoInfo.owner,
        repo: repoInfo.repo
      });
      console.log(`Deleted existing embeddings for ${repoInfo.owner}/${repoInfo.repo}`);
    } else {
      console.log(`Running in incremental mode - will only add new or changed content`);
    }
    
    // Step 6: Generate embeddings and store in vector database
    console.log('\n6. Generating embeddings and storing in vector database...');
    
    // Process in smaller batches to avoid memory issues
    let processedCount = 0;
    
    for (let i = 0; i < chunks.length; i += MAX_BATCH_SIZE) {
      const batch = chunks.slice(i, i + MAX_BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}/${Math.ceil(chunks.length / MAX_BATCH_SIZE)}...`);
      
      try {
        // Generate embeddings with timeout
        const chunksWithEmbeddings = await withTimeout(
          processCodeChunksWithEmbeddings(batch, {
            owner: repoInfo.owner,
            repo: repoInfo.repo
          }),
          PROCESS_TIMEOUT_MS / 2,  // Allow half the total timeout for embedding generation
          'Embedding generation timed out'
        );
        
        // Prepare points for vector database with UUID-based IDs
        const points = chunksWithEmbeddings.map(chunk => {
          // Track the original ID for reference (helps with incremental updates)
          const originalId = `${repoInfo.owner}-${repoInfo.repo}-${chunk.path}-${chunk.type}-${chunk.name}`.replace(/[^a-zA-Z0-9-]/g, '_');
          
          return {
            // Use UUID v4 for Qdrant compatibility (required by Qdrant)
            id: qdrantService.generatePointId(repoInfo.owner + '/' + repoInfo.repo, chunk.path),
            vector: chunk.embedding,
            payload: {
              owner: repoInfo.owner,
              repo: repoInfo.repo,
              path: chunk.path,
              type: chunk.type,
              name: chunk.name,
              content: chunk.content,
              startLine: chunk.startLine,
              endLine: chunk.endLine,
              importance: chunk.importance || 1,
              isPart: chunk.isPart || false,
              partIndex: chunk.partIndex,
              partOf: chunk.partOf,
              lastUpdated: new Date().toISOString(),
              originalId: originalId // Store original ID in metadata for reference
            }
          };
        });
        
        // Store in vector database
        if (points.length > 0) {
          const success = await withTimeout(
            qdrantService.upsert(config.vectorDb.collections.codeEmbeddings, points),
            60000,  // 1 minute timeout for database operations
            'Vector database upsert timed out'
          );
          
          if (success) {
            processedCount += points.length;
            console.log(`Successfully stored ${points.length} embeddings in vector database`);
          } else {
            const errorMessage = `Failed to store embeddings in vector database`;
            console.error(errorMessage);
            if (FAIL_FAST) {
              throw new Error(errorMessage);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}:`, error);
        if (FAIL_FAST) {
          throw error;
        }
      }
    }
    
    console.log(`\nRepository processing complete! Processed ${processedCount} chunks.`);
    
    // Record processing completion
    const endTime = Date.now();
    const duration = endTime - activeJobs.get(jobId).startTime;
    
    // Remove from active jobs
    activeJobs.delete(jobId);
    
    return {
      success: true,
      repoInfo,
      stats: {
        units: units.length,
        chunks: chunks.length,
        embeddings: processedCount,
        durationMs: duration,
        jobId
      }
    };
    
  } catch (error) {
    console.error(`Error processing repository ${repoUrl} (Job ID: ${jobId}):`, error);
    
    // Remove from active jobs
    activeJobs.delete(jobId);
    
    return {
      success: false,
      error: error.message,
      jobId
    };
  }
}

/**
 * Process the next repository in the queue if under concurrency limit
 */
async function processNextInQueue() {
  // Check if we're under the concurrency limit
  if (activeJobs.size < CONCURRENT_PROCESSES && jobQueue.length > 0) {
    const repoUrl = jobQueue.shift();
    
    // Process asynchronously and then check queue again
    processRepository(repoUrl)
      .then(result => {
        console.log(`Completed job for ${repoUrl}: ${result.success ? 'Success' : 'Failed'}`);
        processNextInQueue(); // Check if more can be processed
      })
      .catch(error => {
        console.error(`Unexpected error in job for ${repoUrl}:`, error);
        processNextInQueue(); // Check if more can be processed
      });
      
    // Start another job if possible
    processNextInQueue();
  }
}

/**
 * Update all known repositories
 */
async function updateAllRepositories() {
  if (isProcessing) {
    console.log('Repository update job is already running, skipping...');
    return;
  }
  
  try {
    isProcessing = true;
    console.log('Starting repository update job...');
    
    // Get all known repositories
    const repositories = await getKnownRepositories();
    console.log(`Found ${repositories.length} repositories to process`);
    
    // Clear the queue and add all repositories
    jobQueue.length = 0;
    repositories.forEach(repoUrl => jobQueue.push(repoUrl));
    
    // Start processing the queue with concurrent processors
    for (let i = 0; i < CONCURRENT_PROCESSES; i++) {
      processNextInQueue();
    }
    
    // Wait for all jobs to complete (this is for admin routes that need to wait)
    // We'll check every 5 seconds until both the queue and active jobs are empty
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (jobQueue.length === 0 && activeJobs.size === 0) {
          clearInterval(checkInterval);
          console.log('\nAll repository processing jobs completed.');
          isProcessing = false;
          resolve({ success: true, message: 'All repositories processed successfully' });
        }
      }, 5000);
      
      // Set a maximum wait time of 2 hours
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('\nRepository update job timed out waiting for completion.');
        console.log(`Current status: ${jobQueue.length} in queue, ${activeJobs.size} active jobs`);
        isProcessing = false;
        resolve({ 
          success: false, 
          message: 'Repository update job timed out',
          activeJobs: Array.from(activeJobs.entries()).map(([id, job]) => ({
            id,
            url: job.url,
            runningFor: (Date.now() - job.startTime) / 60000 + ' minutes'
          }))
        });
      }, 7200000); // 2 hour timeout
    });
  } catch (error) {
    console.error('Error in updateAllRepositories:', error);
    isProcessing = false;
    return { success: false, error: error.message };
  }
}
    
/**
 * Get status of current repository processing jobs
 */
function getProcessingStatus() {
  return {
    isProcessing,
    queueLength: jobQueue.length,
    activeJobs: Array.from(activeJobs.entries()).map(([id, job]) => ({
      id,
      url: job.url,
      runningFor: (Date.now() - job.startTime) / 60000 + ' minutes'
    }))
  };
}

/**
 * Cancel all active jobs
 */
function cancelAllJobs() {
  const activeCount = activeJobs.size;
  const queueCount = jobQueue.length;
  
  // Clear queue
  jobQueue.length = 0;
  
  // Mark active jobs as no longer processing
  activeJobs.clear();
  isProcessing = false;
  
  return {
    success: true,
    message: `Cancelled ${activeCount} active jobs and removed ${queueCount} jobs from queue`
  };
}

/**
 * Initialize the repository update scheduler
 */
function initializeScheduler() {
  // Don't run the scheduler in test mode
  if (process.env.NODE_ENV === 'test') {
    console.log('Skipping repository update scheduler in test mode');
    return;
  }
  
  console.log('Initializing repository update scheduler');
  
  // Schedule the initial update
  console.log('Scheduling initial repository update...');
  setTimeout(() => {
    updateAllRepositories().catch(error => {
      console.error('Error in initial repository update:', error);
    });
  }, 5000); // Start after 5 seconds to allow the server to initialize
  
  // Schedule recurring updates
  console.log(`Scheduling recurring repository updates every ${UPDATE_INTERVAL_MS / 60000} minutes`);
  
  setInterval(() => {
    updateAllRepositories().catch(error => {
      console.error('Error in scheduled repository update:', error);
    });
  }, UPDATE_INTERVAL_MS);
  
  return {
    success: true,
    message: `Repository scheduler initialized with ${CONCURRENT_PROCESSES} concurrent processors and update interval of ${UPDATE_INTERVAL_MS / 60000} minutes`
  };
}

module.exports = {
  processRepository,
  updateAllRepositories,
  initializeScheduler,
  getProcessingStatus,
  cancelAllJobs
};
