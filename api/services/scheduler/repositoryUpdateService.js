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

// Flag to track if a job is currently running
let isProcessing = false;

/**
 * Process a single repository through the entire pipeline
 * @param {string} repoUrl - GitHub repository URL
 */
async function processRepository(repoUrl) {
  try {
    console.log(`\n=== Processing repository: ${repoUrl} ===\n`);
    
    // Step 1: Clone or update the repository
    console.log('1. Cloning/updating repository...');
    const repoInfo = await cloneOrUpdateRepository(repoUrl);
    console.log(`Repository cloned to: ${repoInfo.path}`);
    
    // Step 2: Parse the repository into semantic units
    console.log('\n2. Parsing repository...');
    const units = await parseRepository(repoInfo.path);
    console.log(`Parsed ${units.length} code units from repository`);
    
    // Step 3: Chunk the units
    console.log('\n3. Chunking code units...');
    const chunks = await chunkRepositoryUnits(units);
    console.log(`Created ${chunks.length} chunks from ${units.length} units`);
    
    // Step 4: Initialize the vector database
    console.log('\n4. Initializing vector database...');
    await qdrantService.initialize();
    console.log('Vector database initialized');
    
    // Step 5: Check if we need to delete existing embeddings
    console.log('\n5. Checking for existing embeddings...');
    // Delete existing embeddings for this repository
    await qdrantService.deleteByFilter(config.vectorDb.collections.codeEmbeddings, {
      owner: repoInfo.owner,
      repo: repoInfo.repo
    });
    console.log(`Deleted existing embeddings for ${repoInfo.owner}/${repoInfo.repo}`);
    
    // Step 6: Generate embeddings and store in vector database
    console.log('\n6. Generating embeddings and storing in vector database...');
    
    // Process in smaller batches to avoid memory issues
    const BATCH_SIZE = 50;
    let processedCount = 0;
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);
      
      // Generate embeddings
      const chunksWithEmbeddings = await processCodeChunksWithEmbeddings(batch, {
        owner: repoInfo.owner,
        repo: repoInfo.repo
      });
      
      // Prepare points for vector database
      const points = chunksWithEmbeddings.map(chunk => ({
        id: `${repoInfo.owner}-${repoInfo.repo}-${chunk.path}-${chunk.type}-${chunk.name}`.replace(/[^a-zA-Z0-9-]/g, '_'),
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
          partOf: chunk.partOf
        }
      }));
      
      // Store in vector database
      if (points.length > 0) {
        const success = await qdrantService.upsert(config.vectorDb.collections.codeEmbeddings, points);
        if (success) {
          processedCount += points.length;
          console.log(`Successfully stored ${points.length} embeddings in vector database`);
        } else {
          console.error(`Failed to store embeddings in vector database`);
        }
      }
    }
    
    console.log(`\nRepository processing complete! Processed ${processedCount} chunks.`);
    return {
      success: true,
      repoInfo,
      stats: {
        units: units.length,
        chunks: chunks.length,
        embeddings: processedCount
      }
    };
    
  } catch (error) {
    console.error('Error processing repository:', error);
    return {
      success: false,
      error: error.message
    };
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
    
    const results = [];
    
    // Process each repository
    for (const repoUrl of repositories) {
      try {
        const result = await processRepository(repoUrl);
        results.push({
          url: repoUrl,
          ...result
        });
      } catch (error) {
        console.error(`Error processing repository ${repoUrl}:`, error);
        results.push({
          url: repoUrl,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('\nRepository update job completed.');
    console.log('Results:');
    results.forEach(result => {
      console.log(`- ${result.url}: ${result.success ? 'Success' : 'Failed'}`);
      if (result.stats) {
        console.log(`  Units: ${result.stats.units}, Chunks: ${result.stats.chunks}, Embeddings: ${result.stats.embeddings}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error in updateAllRepositories:', error);
    return [];
  } finally {
    isProcessing = false;
  }
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
  const updateIntervalMs = config.vectorDb.updateIntervalMs || 3600000; // Default: 1 hour
  
  console.log(`Scheduling recurring repository updates every ${updateIntervalMs / 60000} minutes`);
  
  setInterval(() => {
    updateAllRepositories().catch(error => {
      console.error('Error in scheduled repository update:', error);
    });
  }, updateIntervalMs);
}

module.exports = {
  processRepository,
  updateAllRepositories,
  initializeScheduler
};
