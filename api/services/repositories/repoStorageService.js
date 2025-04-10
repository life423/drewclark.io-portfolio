 /**
 * Repository Storage Service
 * 
 * Manages the storage of cloned repositories for code analysis and embedding.
 */
const fs = require('fs').promises;
const path = require('path');

// Directory for storing repository clones
const REPO_STORAGE_DIR = path.join(__dirname, '../../../data/repositories');

/**
 * Ensures the repository storage directory exists
 * @returns {Promise<string>} Path to the repository storage directory
 */
async function ensureRepoStorage() {
  try {
    await fs.mkdir(REPO_STORAGE_DIR, { recursive: true });
    console.log(`Repository storage directory created at: ${REPO_STORAGE_DIR}`);
    return REPO_STORAGE_DIR;
  } catch (error) {
    console.error('Failed to create repository storage directory:', error);
    throw error;
  }
}

/**
 * Gets the path for a specific repository
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @returns {string} Path to the repository
 */
function getRepositoryPath(owner, repo) {
  return path.join(REPO_STORAGE_DIR, `${owner}-${repo}`);
}

/**
 * Checks if a repository has already been cloned
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @returns {Promise<boolean>} Whether the repository exists
 */
async function repositoryExists(owner, repo) {
  try {
    const repoPath = getRepositoryPath(owner, repo);
    await fs.access(repoPath);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  ensureRepoStorage,
  getRepositoryPath,
  repositoryExists,
  REPO_STORAGE_DIR
};
