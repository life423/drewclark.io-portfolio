/**
 * Repository Utilities
 * 
 * Provides utilities for handling repository URLs and detection
 * from user questions.
 */

/**
 * Extract GitHub repository URL from a question
 * @param {string} question - User question
 * @returns {string|null} GitHub repository URL or null if not found
 */
function extractRepositoryUrl(question) {
  if (!question) return null;
  
  // Simple pattern to extract GitHub URLs
  const githubUrlPattern = /(https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/g;
  const matches = question.match(githubUrlPattern);
  
  if (matches && matches.length > 0) {
    return matches[0]; // Return the first match
  }
  
  // Check for keywords that might indicate the portfolio repo
  if (question.toLowerCase().includes('portfolio') || 
      question.toLowerCase().includes('drewclark.io') || 
      question.toLowerCase().includes('this project') || 
      question.toLowerCase().includes('this app') ||
      question.toLowerCase().includes('this website')) {
    return 'https://github.com/life423/drewclark.io-portfolio';
  }
  
  return null;
}

/**
 * Sanitize and normalize a repository URL
 * @param {string} repoUrl - GitHub repository URL
 * @returns {string} Normalized URL
 */
function normalizeRepositoryUrl(repoUrl) {
  if (!repoUrl) return null;
  
  // Remove trailing slashes
  let normalizedUrl = repoUrl.trim().replace(/\/+$/, '');
  
  // Remove .git extension if present
  normalizedUrl = normalizedUrl.replace(/\.git$/, '');
  
  // Ensure https protocol
  if (!normalizedUrl.startsWith('http')) {
    // If it's a GitHub repo in the format username/repo, add the protocol and domain
    if (normalizedUrl.match(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/)) {
      normalizedUrl = `https://github.com/${normalizedUrl}`;
    } else {
      normalizedUrl = `https://${normalizedUrl}`;
    }
  }
  
  return normalizedUrl;
}

/**
 * Check if a repository URL belongs to a GitHub repository
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a GitHub repository URL
 */
function isGitHubRepositoryUrl(url) {
  if (!url) return false;
  
  // Check for GitHub repository URL pattern
  const githubRepoPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/;
  return githubRepoPattern.test(url);
}

/**
 * Extract owner and repo name from a GitHub URL
 * @param {string} url - GitHub repository URL
 * @returns {Object|null} Object with owner and repo, or null if not a valid GitHub URL
 */
function extractRepoDetails(url) {
  if (!url) return null;
  
  const normalizedUrl = normalizeRepositoryUrl(url);
  
  // GitHub URL pattern with capture groups
  const pattern = /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/;
  const match = normalizedUrl.match(pattern);
  
  if (match && match.length >= 3) {
    return {
      owner: match[1],
      repo: match[2]
    };
  }
  
  return null;
}

module.exports = {
  extractRepositoryUrl,
  normalizeRepositoryUrl,
  isGitHubRepositoryUrl,
  extractRepoDetails
};
