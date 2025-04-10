/**
 * Seed Qdrant Vector Database
 * 
 * This module handles seeding vector collections in Qdrant
 * with existing embeddings from repositories or other sources.
 */

const fs = require('fs');
const path = require('path');
const { log, colors, rootDir, httpRequest } = require('../utils');
const { isQdrantRunning, waitForQdrantHealth } = require('./ensure');

// Configuration
const config = {
  qdrantPort: 6333,
  embeddingsDir: path.join(rootDir, 'data', 'embeddings'),
  repositoriesDir: path.join(rootDir, 'data', 'repositories'),
  vectorDimension: 1536, // OpenAI embedding dimension
  batchSize: 100 // Number of vectors to upload in a single batch
};

/**
 * Get list of repositories to process
 */
function getRepositories() {
  try {
    // Check if the git_repos.txt file exists
    const reposFilePath = path.join(rootDir, 'git_repos.txt');
    if (fs.existsSync(reposFilePath)) {
      // Read the file and parse repository URLs
      const content = fs.readFileSync(reposFilePath, 'utf8');
      const repos = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      
      return repos;
    } else {
      log('git_repos.txt file not found', 'warning');
      return [];
    }
  } catch (error) {
    log(`Error reading repositories: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Check if embeddings exist for a repository
 */
function getExistingEmbeddings(repoName) {
  try {
    const folderName = repoName.replace(/[\/:]/g, '-');
    const embeddingsPath = path.join(config.embeddingsDir, `${folderName}.json`);
    
    if (fs.existsSync(embeddingsPath)) {
      const data = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
      return {
        exists: true,
        count: data.length || 0,
        data: data
      };
    } else {
      return { exists: false, count: 0, data: [] };
    }
  } catch (error) {
    log(`Error checking embeddings for ${repoName}: ${error.message}`, 'error');
    return { exists: false, count: 0, data: [] };
  }
}

/**
 * Upload embeddings to Qdrant collection
 */
async function uploadEmbeddings(collectionName, embeddings) {
  if (!embeddings || embeddings.length === 0) {
    log(`No embeddings to upload for ${collectionName}`, 'warning');
    return { success: false, reason: 'no-embeddings' };
  }
  
  log(`Uploading ${embeddings.length} embeddings to ${collectionName}...`, 'info');
  
  try {
    // Prepare batches
    const batches = [];
    for (let i = 0; i < embeddings.length; i += config.batchSize) {
      batches.push(embeddings.slice(i, i + config.batchSize));
    }
    
    log(`Prepared ${batches.length} batches`, 'info');
    
    // Upload each batch
    let successCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      log(`Uploading batch ${i + 1}/${batches.length} (${batch.length} points)...`, 'info');
      
      const url = `http://localhost:${config.qdrantPort}/collections/${collectionName}/points`;
      await httpRequest(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      }, 30000, JSON.stringify({
        points: batch.map(embedding => ({
          id: embedding.id || crypto.randomUUID(),
          vector: embedding.vector,
          payload: embedding.metadata || {}
        }))
      }));
      
      successCount += batch.length;
      log(`Batch ${i + 1} uploaded successfully`, 'success');
    }
    
    log(`Successfully uploaded ${successCount}/${embeddings.length} embeddings to ${collectionName}`, 'success');
    return { success: true, count: successCount };
  } catch (error) {
    log(`Error uploading embeddings: ${error.message}`, 'error');
    return { success: false, reason: error.message };
  }
}

/**
 * Process a repository and upload its embeddings
 */
async function processRepository(repoUrl) {
  // Extract repository name from URL
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const repoOwner = repoUrl.split('/').slice(-2)[0];
  const fullName = `${repoOwner}-${repoName}`;
  
  log(`Processing repository: ${fullName}`, 'info');
  
  // Check if embeddings exist
  const embeddings = getExistingEmbeddings(fullName);
  
  if (!embeddings.exists) {
    log(`No embeddings found for ${fullName}`, 'warning');
    return { success: false, reason: 'no-embeddings' };
  }
  
  log(`Found ${embeddings.count} embeddings for ${fullName}`, 'success');
  
  // Upload embeddings to Qdrant
  return await uploadEmbeddings('code_embeddings', embeddings.data);
}

/**
 * Main function to seed Qdrant with embeddings
 */
async function seedQdrant() {
  console.log(`\n${colors.bright}Seeding Qdrant Vector Database${colors.reset}\n`);
  
  try {
    // Step 1: Ensure Qdrant is running
    if (!(await isQdrantRunning())) {
      log('Qdrant is not running. Please start it with "npm run qdrant:start" first.', 'error');
      return { success: false, reason: 'qdrant-not-running' };
    }
    
    // Step 2: Ensure Qdrant is healthy
    if (!(await waitForQdrantHealth())) {
      log('Qdrant is not healthy. Please check its status and try again.', 'error');
      return { success: false, reason: 'qdrant-not-healthy' };
    }
    
    // Step 3: Check for embeddings directory
    if (!fs.existsSync(config.embeddingsDir)) {
      fs.mkdirSync(config.embeddingsDir, { recursive: true });
      log(`Created embeddings directory at ${config.embeddingsDir}`, 'info');
    }
    
    // Step 4: Process repositories from git_repos.txt
    const repositories = getRepositories();
    
    if (repositories.length === 0) {
      log('No repositories found in git_repos.txt', 'warning');
      return { success: false, reason: 'no-repositories' };
    }
    
    log(`Found ${repositories.length} repositories to process`, 'info');
    
    // Step 5: Process each repository
    const results = [];
    for (const repo of repositories) {
      const result = await processRepository(repo);
      results.push({ repo, result });
    }
    
    // Step 6: Summarize results
    const successful = results.filter(r => r.result.success).length;
    
    if (successful === 0) {
      log('No repositories were successfully processed', 'error');
      return { success: false, reason: 'all-failed' };
    } else {
      log(`Successfully processed ${successful}/${repositories.length} repositories`, 'success');
      return { success: true, processed: successful, total: repositories.length };
    }
  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'error');
    console.error(error);
    return { success: false, reason: 'unexpected-error', error: error.message };
  }
}

module.exports = { seedQdrant };
