/**
 * askGPT Integration Example for Code Embedding POC
 * 
 * This file demonstrates how to integrate the code embedding
 * functionality with the existing askGPT endpoint.
 */

const { vectorStore } = require('./vector-store');
const { extractRepoInfo } = require('../github-utils');

/**
 * Enhances a user question with relevant code segments from the repository
 * @param {string} question - Original user question
 * @param {string} repoUrl - GitHub repository URL (optional)
 * @returns {Promise<string>} Enhanced question with code context
 */
async function enhanceWithCodeContext(question, repoUrl) {
  try {
    // If no repository URL is provided, try to extract it from the question
    if (!repoUrl) {
      const githubUrlPattern = /https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+/g;
      const matches = question.match(githubUrlPattern);
      
      if (matches && matches.length > 0) {
        repoUrl = matches[0];
      } else {
        console.log('No GitHub URL found in question');
        return question;
      }
    }
    
    // Extract repository owner and name
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      console.log('Invalid GitHub repository URL:', repoUrl);
      return question;
    }
    
    const { owner, repo } = repoInfo;
    
    // Load repository embeddings if not already loaded
    if (!vectorStore.isLoaded || vectorStore.size === 0) {
      console.log(`Loading embeddings for ${owner}/${repo}...`);
      const loaded = await vectorStore.loadRepository(owner, repo);
      
      if (!loaded) {
        console.log(`No embeddings available for ${owner}/${repo}`);
        return question;
      }
      
      console.log(`Loaded ${vectorStore.size} code segments`);
    }
    
    // Find relevant code segments for the question
    console.log(`Finding code relevant to: "${question}"`);
    const relevantCode = await vectorStore.findSimilarCode(question, 3);
    
    if (relevantCode.length === 0) {
      console.log('No relevant code found for this question');
      return question;
    }
    
    console.log(`Found ${relevantCode.length} relevant code segments`);
    
    // Format the relevant code as context
    let codeContext = `

RELEVANT CODE SEGMENTS:

`;
    
    relevantCode.forEach((segment, index) => {
      codeContext += `[${index + 1}] ${segment.type.toUpperCase()}: ${segment.name}\n`;
      codeContext += `File: ${segment.path}\n`;
      codeContext += `Lines: ${segment.startLine}-${segment.endLine}\n`;
      codeContext += `Language: ${segment.language}\n`;
      codeContext += "```\n";
      codeContext += segment.content;
      codeContext += "\n```\n\n";
    });
    
    // Return the enhanced question with code context
    return `${question}\n${codeContext}`;
  } catch (error) {
    console.error('Error enhancing question with code context:', error.message);
    // If there's an error, return the original question
    return question;
  }
}

/**
 * Example of integration with askGPT/index.js
 * 
 * This shows how you would modify the existing enhanceWithRepositoryContent
 * function in the askGPT endpoint to include code embedding functionality.
 */
async function enhanceWithRepositoryContentExample(question, logFunctions = { info: console.log, error: console.error }) {
  try {
    // Extract GitHub URLs from the question (existing functionality)
    const githubUrlPattern = /https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+/g;
    const githubUrls = question.match(githubUrlPattern) || [];
    
    if (githubUrls.length === 0) {
      logFunctions.info('No GitHub URLs found in the question');
      return question;
    }
    
    logFunctions.info(`Found ${githubUrls.length} GitHub URLs in the question`);
    
    // Get the first GitHub URL (simplification for the POC)
    const repoUrl = githubUrls[0];
    
    // INTEGRATION POINT: Use code embeddings to enhance the question
    const enhancedQuestion = await enhanceWithCodeContext(question, repoUrl);
    
    return enhancedQuestion;
  } catch (error) {
    logFunctions.error(`Error enhancing question: ${error.message}`);
    return question;
  }
}

// Example usage in a simple test function
async function testEnhancement() {
  const testQuestion = "How does the authentication system work in https://github.com/user/repo?";
  
  console.log('Original Question:');
  console.log(testQuestion);
  console.log('\n--------------------------\n');
  
  const enhanced = await enhanceWithRepositoryContentExample(testQuestion);
  
  console.log('Enhanced Question:');
  console.log(enhanced);
}

module.exports = {
  enhanceWithCodeContext,
  enhanceWithRepositoryContentExample,
  testEnhancement
};

/**
 * Integration Instructions
 * 
 * To integrate this functionality into the existing askGPT endpoint:
 * 
 * 1. Import the necessary modules at the top of askGPT/index.js:
 *    const { enhanceWithCodeContext } = require('../poc/askgpt-integration');
 * 
 * 2. In the existing enhanceWithRepositoryContent function, add:
 *    // Enhance with code embeddings if available
 *    if (githubUrls.length > 0) {
 *      const repoUrl = githubUrls[0];
 *      const codeEnhancedQuestion = await enhanceWithCodeContext(question, repoUrl);
 *      
 *      // Only use the code-enhanced version if it adds context
 *      if (codeEnhancedQuestion !== question) {
 *        return codeEnhancedQuestion;
 *      }
 *    }
 * 
 * 3. Ensure the data/embeddings directory exists and contains processed
 *    repositories. Use the process-repo.js script to generate embeddings
 *    for repositories you want to support.
 */
