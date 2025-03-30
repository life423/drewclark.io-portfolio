#!/usr/bin/env node
/**
 * Query Script for Code Embedding POC
 * 
 * This script queries the vector store to find code relevant to a question.
 * 
 * Usage: node query.js <owner/repo> <question>
 * Example: node query.js user/repo "How does the authentication system work?"
 */

const { vectorStore } = require('./vector-store');
const readline = require('readline');

// Either get args from command line or enter interactive mode
const args = process.argv.slice(2);
const repoArg = args[0];
const queryArg = args.slice(1).join(' ');

// Create readline interface for interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main function to query code embeddings
 */
async function main() {
  console.log('Code Embedding POC - Code Search');
  console.log('===============================');
  
  let repoOwner, repoName, query;
  
  // Parse repository info
  if (repoArg) {
    const parts = repoArg.split('/');
    if (parts.length !== 2) {
      console.error('Repository must be in format "owner/repo"');
      process.exit(1);
    }
    
    [repoOwner, repoName] = parts;
    console.log(`Repository: ${repoOwner}/${repoName}`);
  } else {
    // Interactive mode for repository selection
    const repoInput = await promptUser('Enter repository (owner/repo): ');
    const parts = repoInput.split('/');
    
    if (parts.length !== 2) {
      console.error('Repository must be in format "owner/repo"');
      process.exit(1);
    }
    
    [repoOwner, repoName] = parts;
  }
  
  // Load repository embeddings
  console.log(`\nLoading embeddings for ${repoOwner}/${repoName}...`);
  const loaded = await vectorStore.loadRepository(repoOwner, repoName);
  
  if (!loaded) {
    console.error(`Failed to load embeddings for ${repoOwner}/${repoName}`);
    console.error('Make sure you have processed this repository with process-repo.js first');
    process.exit(1);
  }
  
  console.log(`Loaded ${vectorStore.size} code segments`);
  
  // Process a single query or enter interactive mode
  if (queryArg) {
    query = queryArg;
    await processQuery(query);
    rl.close();
  } else {
    // Interactive mode
    await interactiveMode();
  }
}

/**
 * Interactive query mode
 */
async function interactiveMode() {
  console.log('\nEntering interactive query mode. Type "exit" to quit.');
  
  while (true) {
    const query = await promptUser('\nEnter your code question: ');
    
    if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
      console.log('Exiting...');
      break;
    }
    
    await processQuery(query);
  }
  
  rl.close();
}

/**
 * Process a single query
 * @param {string} query - User question
 */
async function processQuery(query) {
  try {
    console.log(`\nSearching for: "${query}"`);
    console.log('-----------------------------------------------');
    
    const startTime = Date.now();
    const results = await vectorStore.findSimilarCode(query);
    const duration = Date.now() - startTime;
    
    if (results.length === 0) {
      console.log('No relevant code found');
      return;
    }
    
    console.log(`Found ${results.length} relevant code segments in ${duration}ms:\n`);
    
    // Display results
    results.forEach((match, index) => {
      console.log(`[${index + 1}] ${match.type}: ${match.name}`);
      console.log(`    File: ${match.path}`);
      console.log(`    Similarity: ${(match.similarity * 100).toFixed(2)}%`);
      console.log(`    Lines: ${match.startLine}-${match.endLine}`);
      console.log('    ---------------------');
      
      // Show snippet (first few lines)
      const codeLines = match.content.split('\n');
      const preview = codeLines.slice(0, Math.min(5, codeLines.length)).join('\n');
      console.log(`    ${preview}${codeLines.length > 5 ? '\n    ...(truncated)' : ''}`);
      
      console.log();
    });
    
    // Provide option to see full code
    if (results.length > 0) {
      const choice = await promptUser('Enter a number to see full code, or press Enter to continue: ');
      
      if (choice && !isNaN(choice)) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < results.length) {
          console.log('\n==============================================');
          console.log(`FULL CODE: ${results[index].type} ${results[index].name}`);
          console.log(`File: ${results[index].path}`);
          console.log('==============================================\n');
          console.log(results[index].content);
          console.log('\n==============================================');
        }
      }
    }
  } catch (error) {
    console.error('Error processing query:', error.message);
  }
}

/**
 * Helper function for readline prompts
 * @param {string} question - Prompt text
 * @returns {Promise<string>} User input
 */
function promptUser(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
