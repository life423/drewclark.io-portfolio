const axios = require('axios');
const config = require('./config');

// Simple in-memory cache for GitHub content
const githubCache = new Map();
const GITHUB_CACHE_TTL = 3600000; // 1 hour cache

/**
 * Extracts the owner and repo name from a GitHub URL
 * @param {string} url - GitHub repository URL
 * @returns {Object|null} Object containing owner and repo if valid URL, null otherwise
 */
function extractRepoInfo(url) {
  if (!url) return null;
  
  try {
    // Handle different GitHub URL formats
    const githubRegex = /github\.com\/([^\/]+)\/([^\/\s]+)/;
    const match = url.match(githubRegex);
    
    if (match && match.length >= 3) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '') // Remove .git suffix if present
      };
    }
    return null;
  } catch (error) {
    console.error(`Error extracting repo info from URL ${url}:`, error.message);
    return null;
  }
}

/**
 * Fetches README content from a GitHub repository
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @param {Function} logError - Error logging function
 * @returns {Promise<string>} README content or empty string if not found
 */
async function fetchReadmeContent(owner, repo, logError = console.error) {
  const cacheKey = `readme-${owner}-${repo}`;
  
  // Check cache first
  const cached = githubCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GITHUB_CACHE_TTL) {
    return cached.content;
  }
  
  try {
    // Use GitHub API to get README content
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    const response = await axios.get(readmeUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        // Add GitHub token if available
        ...(config.githubToken ? { 'Authorization': `token ${config.githubToken}` } : {})
      },
      timeout: 5000 // 5 second timeout
    });
    
    const content = response.data;
    
    // Cache the result
    githubCache.set(cacheKey, {
      timestamp: Date.now(),
      content
    });
    
    return content;
  } catch (error) {
    // Try with master branch if main fails
    try {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const response = await axios.get(readmeUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          ...(config.githubToken ? { 'Authorization': `token ${config.githubToken}` } : {})
        },
        timeout: 5000
      });
      
      const content = response.data;
      
      // Cache the result
      githubCache.set(cacheKey, {
        timestamp: Date.now(),
        content
      });
      
      return content;
    } catch (fallbackError) {
      logError(`Error fetching README for ${owner}/${repo}: ${fallbackError.message}`);
      return '';
    }
  }
}

/**
 * Fetches relevant documentation from a GitHub repository
 * @param {string} repoUrl - GitHub repository URL
 * @param {Function} logError - Error logging function
 * @returns {Promise<string>} Repository documentation content
 */
async function fetchRepositoryDocs(repoUrl, logError = console.error) {
  try {
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      return `No valid GitHub repository information found in URL: ${repoUrl}`;
    }
    
    const { owner, repo } = repoInfo;
    
    // Fetch README content
    const readmeContent = await fetchReadmeContent(owner, repo, logError);
    
    if (!readmeContent) {
      return `Could not fetch documentation for ${owner}/${repo}. Please refer to ${repoUrl} for more information.`;
    }
    
    // Format and return the content with source attribution
    return `
GITHUB REPOSITORY DOCUMENTATION (${owner}/${repo}):

${readmeContent}

Source: ${repoUrl}
    `.trim();
  } catch (error) {
    logError(`Error fetching repository docs: ${error.message}`);
    return `Error fetching documentation. Please refer to ${repoUrl} directly.`;
  }
}

/**
 * Extracts the most relevant sections from repository documentation based on query
 * @param {string} documentation - Full repository documentation
 * @param {string} query - User question or query
 * @param {number} maxLength - Maximum content length to return
 * @returns {string} Relevant documentation extract
 */
function extractRelevantContent(documentation, query, maxLength = 2000) {
  // If documentation is short enough, return it all
  if (documentation.length <= maxLength) {
    return documentation;
  }
  
  // Split documentation into sections
  const sections = documentation.split(/\n#{1,3} /);
  
  // Calculate relevance score for each section
  const scoredSections = sections.map(section => {
    const sectionLower = section.toLowerCase();
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Basic relevance scoring based on term frequency
    const score = queryTerms.reduce((total, term) => {
      if (term.length < 3) return total; // Skip short terms
      const termFrequency = (sectionLower.match(new RegExp(term, 'g')) || []).length;
      return total + termFrequency;
    }, 0);
    
    return { section, score };
  });
  
  // Sort by relevance
  scoredSections.sort((a, b) => b.score - a.score);
  
  // Combine the most relevant sections
  let result = '';
  let currentLength = 0;
  
  for (const { section } of scoredSections) {
    if (currentLength + section.length <= maxLength) {
      result += (result ? `\n# ${section}` : section);
      currentLength += section.length;
    } else {
      const remainingSpace = maxLength - currentLength;
      if (remainingSpace > 200) { // Only add partial section if enough space remains
        result += `\n# ${section.substring(0, remainingSpace)}... (truncated)`;
      }
      break;
    }
  }
  
  return result;
}

module.exports = {
  extractRepoInfo,
  fetchRepositoryDocs,
  extractRelevantContent
};
