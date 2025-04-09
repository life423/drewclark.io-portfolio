/**
 * Repository Processing Test Script
 * 
 * This script tests the entire repository processing pipeline:
 * - Cloning a GitHub repository
 * - Parsing the code into semantic units
 * - Chunking the units
 * - Generating embeddings
 * - Storing in the vector database
 */
const { cloneOrUpdateRepository } = require('../services/repositories/repoCloneService');
const { parseRepository } = require('../services/codeProcessing/codeParserService');
const { chunkRepositoryUnits } = require('../services/codeProcessing/chunkingService');
const { processCodeChunksWithEmbeddings } = require('../services/embeddings/embeddingService');
const qdrantService = require('../services/vectorDb/qdrantService');
const config = require('../config');

/**
 * Process a repository through the entire pipeline
 * @param {string} repoUrl - GitHub repository URL
 */
async function processRepository(repoUrl) {
  try {
    console.log(`\n=== Starting repository processing for ${repoUrl} ===\n`);
    
    // Step 1: Clone or update the repository
    console.log('Step 1: Cloning/updating repository...');
    const repoInfo = await cloneOrUpdateRepository(repoUrl);
    console.log(`Repository cloned to: ${repoInfo.path}`);
    
    // Step 2: Parse the repository into semantic units
    console.log('\nStep 2: Parsing repository...');
    const units = await parseRepository(repoInfo.path);
    console.log(`Parsed ${units.length} code units from repository`);
    
    // Step 3: Chunk the units
    console.log('\nStep 3: Chunking code units...');
    const chunks = await chunkRepositoryUnits(units);
    console.log(`Created ${chunks.length} chunks from ${units.length} units`);
    
    // Step 4: Initialize the vector database
    console.log('\nStep 4: Initializing vector database...');
    await qdrantService.initialize();
    console.log('Vector database initialized');
    
    // Step 5: Generate embeddings and store in vector database
    console.log('\nStep 5: Generating embeddings and storing in vector database...');
    
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
      
      // Prepare points for vector database with UUID-based IDs
      const points = chunksWithEmbeddings.map(chunk => {
        // Track the original ID for reference (helps with incremental updates)
        const originalId = `${repoInfo.owner}-${repoInfo.repo}-${chunk.path}-${chunk.type}-${chunk.name}`.replace(/[^a-zA-Z0-9-]/g, '_');
        
        return {
          // Use UUID v4 for Qdrant compatibility
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
            originalId: originalId // Store original ID in metadata for reference
          }
        };
      });
      
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
    
    // Step 6: Test a simple search
    if (processedCount > 0) {
      console.log('\nTesting search...');
      await testSearch(repoInfo);
    }
    
  } catch (error) {
    console.error('Error processing repository:', error);
  }
}

/**
 * Test vector search functionality
 * @param {Object} repoInfo - Repository information
 */
async function testSearch(repoInfo) {
  try {
    const testQueries = [
      'How does the chat component work?',
      'What is the project structure?',
      'How does authentication work?'
    ];
    
    // Choose one test query
    const query = testQueries[0];
    
    // Generate embedding for the query
    const { generateEmbedding } = require('../services/embeddings/embeddingService');
    const queryEmbedding = await generateEmbedding(query);
    
    // Search the vector database
    const results = await qdrantService.search(
      config.vectorDb.collections.codeEmbeddings,
      queryEmbedding,
      { owner: repoInfo.owner, repo: repoInfo.repo },
      3 // Limit to 3 results
    );
    
    console.log(`\nSearch results for "${query}":`);
    
    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1} (Score: ${result.score.toFixed(3)}):`);
      console.log(`- File: ${result.payload.path}`);
      console.log(`- Type: ${result.payload.type}`);
      console.log(`- Name: ${result.payload.name}`);
      
      // Show a snippet of the content
      const snippet = result.payload.content.length > 200 
        ? result.payload.content.substring(0, 200) + '...' 
        : result.payload.content;
      
      console.log(`- Snippet: ${snippet.replace(/\n/g, ' ').substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('Error testing search:', error);
  }
}

// Run the test with the portfolio repository
const portfolioRepo = 'https://github.com/life423/drewclark.io-portfolio';

processRepository(portfolioRepo)
  .then(() => {
    console.log('\nScript completed successfully');
  })
  .catch(error => {
    console.error('Script failed:', error);
  });
