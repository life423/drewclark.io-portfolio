#!/usr/bin/env node
/**
 * Ensure Qdrant Vector Database is running and healthy
 * 
 * This script:
 * 1. Checks if Docker is installed and running
 * 2. Ensures the Qdrant container is running
 * 3. Verifies the Qdrant service is healthy
 * 4. Creates necessary collections if they don't exist
 */

const { 
  log, 
  execPromise, 
  colors, 
  isWindows, 
  httpRequest,
  withRetry,
  rootDir
} = require('./utils');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  qdrantPort: 6333,
  qdrantComposeFile: path.join(rootDir, 'docker-compose-qdrant.yml'),
  healthCheckTimeout: 30000, // 30 seconds
  healthCheckInterval: 1000, // 1 second
  vectorDimension: 1536 // OpenAI embedding dimension
};

/**
 * Check if Docker is installed and running
 */
async function checkDockerRunning() {
  try {
    log('Checking if Docker is installed and running...', 'docker');
    
    // Check if Docker is installed
    await execPromise('docker --version');
    
    // Check if Docker is running by executing a simple command
    await execPromise('docker ps');
    
    log('Docker is installed and running', 'success');
    return true;
  } catch (error) {
    if (error.message.includes('not found')) {
      log('Docker is not installed. Please install Docker to use container features.', 'error');
    } else {
      log('Docker is installed but not running. Please start Docker.', 'error');
    }
    return false;
  }
}

/**
 * Check if Qdrant container is running
 */
async function isQdrantRunning() {
  try {
    const output = await execPromise('docker ps --filter "name=qdrant" --format "{{.Names}}"');
    return output.includes('qdrant');
  } catch (error) {
    return false;
  }
}

/**
 * Start the Qdrant container
 */
async function startQdrantContainer() {
  try {
    log('Starting Qdrant container...', 'docker');
    
    // Check if the Docker compose file exists
    if (!fs.existsSync(config.qdrantComposeFile)) {
      log(`Docker compose file not found: ${config.qdrantComposeFile}`, 'error');
      return false;
    }
    
    // Check if Qdrant is already running
    if (await isQdrantRunning()) {
      log('Qdrant container is already running', 'success');
      return true;
    }
    
    // Start the container using docker-compose
    await execPromise(`docker-compose -f ${config.qdrantComposeFile} up -d`);
    
    log('Qdrant container started', 'success');
    return true;
  } catch (error) {
    log(`Error starting Qdrant: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Wait for Qdrant to be healthy
 */
async function waitForQdrantHealth() {
  const startTime = Date.now();
  let isHealthy = false;
  
  log('Waiting for Qdrant to be ready...', 'docker');
  
  // Different health check endpoints to try
  const healthEndpoints = [
    '/healthz',            // Standard Kubernetes-style health endpoint
    '/health',             // Common health endpoint
    '/readiness',          // Readiness endpoint
    '/.well-known/health', // Common pattern
    ''                     // Root as fallback
  ];
  
  while (!isHealthy && (Date.now() - startTime) < config.healthCheckTimeout) {
    // Try each endpoint until one works
    for (const endpoint of healthEndpoints) {
      try {
        const url = `http://localhost:${config.qdrantPort}${endpoint}`;
        const response = await httpRequest(url);
        
        if (response.statusCode >= 200 && response.statusCode < 300) {
          log(`Qdrant is responding on endpoint ${endpoint}`, 'success');
          isHealthy = true;
          break;
        }
      } catch (error) {
        // Only log detailed errors on the last endpoint
        if (endpoint === healthEndpoints[healthEndpoints.length - 1]) {
          log(`Health check error (endpoint ${endpoint}): ${error.message}`, 'info');
        }
      }
    }
    
    if (!isHealthy) {
      // Print a progress indicator
      process.stdout.write('.');
      
      // Wait before the next try
      await new Promise(resolve => setTimeout(resolve, config.healthCheckInterval));
    }
  }
  
  if (!isHealthy) {
    log('Qdrant health check timed out. Vector search may not work properly.', 'warning');
    return false;
  } else {
    log('Qdrant is healthy and ready to use', 'success');
    return true;
  }
}

/**
 * Make sure collections exist with correct schema
 */
async function ensureCollections() {
  try {
    // Collection names
    const collections = [
      'code_embeddings',
      'document_embeddings',
      'commit_embeddings'
    ];
    
    // Get existing collections
    const url = `http://localhost:${config.qdrantPort}/collections`;
    const response = await httpRequest(url);
    
    if (!response.data || !response.data.collections) {
      log('Could not retrieve collections from Qdrant', 'error');
      return false;
    }
    
    const existingCollections = response.data.collections.map(c => c.name);
    log(`Existing collections: ${existingCollections.join(', ')}`, 'info');
    
    // Create collections that don't exist
    for (const collection of collections) {
      if (!existingCollections.includes(collection)) {
        log(`Creating collection: ${collection}`, 'info');
        
        const createUrl = `http://localhost:${config.qdrantPort}/collections/${collection}`;
        await httpRequest(createUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }, 10000, JSON.stringify({
          vectors: {
            size: config.vectorDimension,
            distance: 'Cosine'
          },
          optimizers_config: {
            indexing_threshold: 100 // Index after 100 vectors
          }
        }));
        
        log(`Collection ${collection} created successfully`, 'success');
      }
    }
    
    log('All collections are properly configured', 'success');
    return true;
  } catch (error) {
    log(`Error ensuring collections: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.bright}Ensuring Qdrant Vector Database${colors.reset}\n`);
  
  try {
    // Step 1: Check Docker
    const dockerRunning = await checkDockerRunning();
    if (!dockerRunning) {
      log('Continuing without Docker. Vector search will use mock implementation.', 'warning');
      return { success: false, reason: 'docker-not-running' };
    }
    
    // Step 2: Start Qdrant container
    const qdrantStarted = await startQdrantContainer();
    if (!qdrantStarted) {
      log('Failed to start Qdrant container. Vector search will use mock implementation.', 'error');
      return { success: false, reason: 'qdrant-start-failed' };
    }
    
    // Step 3: Wait for Qdrant to be healthy
    const qdrantHealthy = await waitForQdrantHealth();
    if (!qdrantHealthy) {
      log('Qdrant is not responding to health checks. Vector search may be unreliable.', 'warning');
      // Continue anyway, as it might work later
    }
    
    // Step 4: Ensure collections exist
    const collectionsEnsured = await withRetry(
      () => ensureCollections(),
      { 
        retries: 5,
        initialDelay: 2000,
        onRetry: (err, attempt) => log(`Retry collection creation (${attempt}/5): ${err.message}`, 'warning')
      }
    );
    
    if (!collectionsEnsured) {
      log('Failed to ensure collections. Vector search may be unreliable.', 'error');
      return { success: false, reason: 'collection-creation-failed' };
    }
    
    log('Qdrant is fully configured and ready for use', 'success');
    return { success: true };
  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'error');
    console.error(error);
    return { success: false, reason: 'unexpected-error', error: error.message };
  }
}

// Run the script if called directly
if (require.main === module) {
  main().then(result => {
    if (!result.success) {
      log(`Qdrant setup completed with issues: ${result.reason}`, 'warning');
      process.exit(1);
    } else {
      log('Qdrant setup completed successfully', 'success');
    }
  }).catch(err => {
    log(`Fatal error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
