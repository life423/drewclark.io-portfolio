#!/usr/bin/env node
/**
 * Repository Processing Script for Code Embedding POC
 * 
 * This script processes a local repository, extracts code segments,
 * generates embeddings, and saves them for later use.
 * 
 * Usage: node process-repo.js <github-url> <local-repo-path>
 * Example: node process-repo.js https://github.com/user/repo ./path/to/local/repo
 */

const { processRepository } = require('./code-parser');
const { processRepositoryEmbeddings } = require('./embeddings');
const { extractRepoInfo } = require('../github-utils');
const path = require('path');

// Get command line arguments
const repoUrl = process.argv[2];
const repoPath = process.argv[3];

if (!repoUrl || !repoPath) {
  console.error('Usage: node process-repo.js <github-url> <local-repo-path>');
  process.exit(1);
}

/**
 * Main function to process a repository
 */
async function main() {
  console.log('Code Embedding POC - Repository Processor');
  console.log('=====================================');
  
  try {
    // Extract repository owner and name from URL
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      console.error('Invalid GitHub repository URL');
      process.exit(1);
    }
    
    const { owner, repo } = repoInfo;
    console.log(`Processing repository: ${owner}/${repo}`);
    console.log(`Local path: ${path.resolve(repoPath)}`);
    
    // Step 1: Extract code segments from the repository
    console.log('\nStep 1: Extracting code segments...');
    const segments = await processRepository(repoPath);
    console.log(`Extracted ${segments.length} code segments`);
    
    // Step 2: Generate and save embeddings
    console.log('\nStep 2: Generating embeddings...');
    const embeddingsPath = await processRepositoryEmbeddings(segments, owner, repo);
    
    console.log('\nRepository processing complete!');
    console.log(`Embeddings saved to: ${embeddingsPath}`);
    
    console.log('\nNext steps:');
    console.log('1. Use the query.js script to test code search');
    console.log('2. Integrate with askGPT to enhance AI responses');
    
  } catch (error) {
    console.error('Error processing repository:', error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
