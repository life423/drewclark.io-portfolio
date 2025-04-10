/**
 * Code Context Service
 * 
 * Enhances AI questions with relevant code context from the vector database.
 * This service bridges the repository processing and embedding system with the
 * AI question answering functionality.
 */
const qdrantService = require('../vectorDb/qdrantService');
const { generateEmbedding } = require('../embeddings/embeddingService');
const { cloneOrUpdateRepository } = require('../repositories/repoCloneService');
const { limitSnippetsToTokenBudget } = require('./tokenUtils');
const config = require('../../config');

// Minimum relevance score threshold for including snippets
const MIN_SIMILARITY_SCORE = 0.65;

// Maximum tokens to allocate for code snippets
const MAX_SNIPPET_TOKENS = 2500;

/**
 * Enhances a question with relevant code snippets
 * @param {string} question - The user's question
 * @param {string} repoUrl - GitHub repository URL
 * @param {number} limit - Maximum number of code snippets to include
 * @returns {Promise<string>} - Enhanced question with code context
 */
async function enhanceQuestionWithCodeContext(question, repoUrl, limit = 8) {
  try {
    if (!question || !repoUrl) {
      return question;
    }

    console.log(`Enhancing question with code context from ${repoUrl}`);
    
    // Extract repo information from URL
    const repoInfo = await getRepositoryInfo(repoUrl);
    if (!repoInfo) {
      console.log(`Could not extract repository information from ${repoUrl}`);
      return question;
    }

    // Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);
    
    // Search the vector database for relevant code (get more than we need for filtering)
    const searchResults = await qdrantService.search(
      config.vectorDb.collections.codeEmbeddings,
      queryEmbedding,
      { owner: repoInfo.owner, repo: repoInfo.repo },
      limit * 2 // Get more results for better filtering
    );
    
    if (searchResults.length === 0) {
      console.log('No relevant code found for this question');
      return question;
    }
    
    console.log(`Found ${searchResults.length} potential code segments`);
    
    // Filter by similarity score and avoid duplicate files
    const filteredResults = filterCodeResults(searchResults, limit);
    
    if (filteredResults.length === 0) {
      console.log('No code segments passed the relevance filter');
      return question;
    }
    
    // Apply token budget limits
    const limitedResults = limitSnippetsToTokenBudget(filteredResults, MAX_SNIPPET_TOKENS);
    
    console.log(`Selected ${limitedResults.length} relevant code segments within token budget`);
    
    // Format the relevant code as context
    let codeContext = `

RELEVANT CODE SEGMENTS FROM ${repoInfo.owner}/${repoInfo.repo}:

`;
    
    limitedResults.forEach((segment, index) => {
      const payload = segment.payload;
      codeContext += `[${index + 1}] ${payload.type.toUpperCase()}: ${payload.name}\n`;
      codeContext += `File: ${payload.path}\n`;
      
      if (payload.startLine && payload.endLine) {
        codeContext += `Lines: ${payload.startLine}-${payload.endLine}\n`;
      }
      
      // Add score as a comment for debugging (can be removed in production)
      codeContext += `// Relevance: ${segment.score.toFixed(2)}\n`;
      
      codeContext += "```\n";
      codeContext += payload.content;
      codeContext += "\n```\n\n";
    });
    
    // Return the enhanced question with code context
    return `${question}\n${codeContext}`;
  } catch (error) {
    console.error('Error enhancing question with code context:', error);
    // In case of error, return the original question
    return question;
  }
}

/**
 * Get repository information from URL or clone if necessary
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<Object>} Repository information
 */
async function getRepositoryInfo(repoUrl) {
  try {
    const githubUrlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/\s]+)/;
    const match = repoUrl.match(githubUrlPattern);
    
    if (!match || match.length < 3) {
      return null;
    }
    
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, ''); // Remove .git if present
    
    // Check if we need to clone/update the repository
    try {
      // This will clone the repo if it doesn't exist or update it if it does
      const repoInfo = await cloneOrUpdateRepository(repoUrl);
      return repoInfo;
    } catch (cloneError) {
      console.error(`Error cloning repository ${repoUrl}:`, cloneError);
      // Continue with basic information even if clone fails
      return { owner, repo, path: null, url: repoUrl };
    }
  } catch (error) {
    console.error('Error getting repository information:', error);
    return null;
  }
}

/**
 * Process a repository to ensure it's indexed in the vector database
 * This is a helper function that can be called to trigger repository processing
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<boolean>} Success status
 */
async function ensureRepositoryProcessed(repoUrl) {
  try {
    // This will clone/update the repository
    const repoInfo = await getRepositoryInfo(repoUrl);
    if (!repoInfo) {
      return false;
    }
    
    // Check if the repository is already indexed
    const count = await qdrantService.count(
      config.vectorDb.collections.codeEmbeddings,
      { owner: repoInfo.owner, repo: repoInfo.repo }
    );
    
    if (count > 0) {
      console.log(`Repository ${repoInfo.owner}/${repoInfo.repo} already indexed with ${count} chunks`);
      return true;
    }
    
    // If not indexed and we have the path, we could trigger processing
    // But this would be an expensive operation to do on demand
    // Instead, we might want to schedule this or do it in the background
    console.log(`Repository ${repoInfo.owner}/${repoInfo.repo} is not indexed yet`);
    
    // For now, we'll just return false to indicate it's not processed
    // A background job should handle the processing
    return false;
  } catch (error) {
    console.error('Error ensuring repository is processed:', error);
    return false;
  }
}

/**
 * Filter code search results to ensure quality and diversity
 * @param {Array} searchResults - Raw search results from Qdrant
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Filtered results
 */
function filterCodeResults(searchResults, limit = 5) {
  if (!searchResults || searchResults.length === 0) return [];
  
  // First filter by minimum similarity score
  const qualityResults = searchResults.filter(result => result.score >= MIN_SIMILARITY_SCORE);
  
  if (qualityResults.length === 0) return [];
  
  // Sort by score (highest first)
  qualityResults.sort((a, b) => b.score - a.score);
  
  // Deduplicate while maintaining diversity
  // We want to avoid too many snippets from the same file
  const filteredResults = [];
  const filesIncluded = new Set();
  
  // First pass - include top result from each file (up to limit)
  for (const result of qualityResults) {
    if (filteredResults.length >= limit) break;
    
    const filePath = result.payload.path;
    
    if (!filesIncluded.has(filePath)) {
      filteredResults.push(result);
      filesIncluded.add(filePath);
    }
  }
  
  // If we have room for more and there are highly relevant results
  // from already included files, add them too
  if (filteredResults.length < limit) {
    for (const result of qualityResults) {
      if (filteredResults.length >= limit) break;
      
      const filePath = result.payload.path;
      
      // If we've already included this file but this snippet is highly relevant,
      // include it as well (for very high scores)
      if (filesIncluded.has(filePath) && !filteredResults.includes(result) && result.score >= MIN_SIMILARITY_SCORE + 0.1) {
        filteredResults.push(result);
      }
    }
  }
  
  return filteredResults;
}

module.exports = {
  enhanceQuestionWithCodeContext,
  getRepositoryInfo,
  ensureRepositoryProcessed
};
