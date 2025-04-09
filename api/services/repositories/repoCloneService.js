/**
 * Repository Clone Service
 * 
 * Handles cloning and updating repositories from GitHub for code analysis.
 */
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const { getRepositoryPath, ensureRepoStorage, repositoryExists } = require('./repoStorageService');
const { extractRepoInfo } = require('../../github-utils');

/**
 * Clones or updates a repository from GitHub
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<{owner: string, repo: string, path: string}>} Repository info
 */
async function cloneOrUpdateRepository(repoUrl) {
  try {
    // Extract repository information from URL
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      throw new Error(`Invalid repository URL: ${repoUrl}`);
    }
    
    const { owner, repo } = repoInfo;
    
    // Ensure storage directory exists
    await ensureRepoStorage();
    
    // Get path for this repository
    const repoPath = getRepositoryPath(owner, repo);
    
    // Check if repository already exists
    const exists = await repositoryExists(owner, repo);
    
    if (exists) {
      console.log(`Updating existing repository: ${owner}/${repo}`);
      // Repository exists, update it
      const git = simpleGit(repoPath);
      
      try {
        // Fetch latest changes
        await git.fetch();
        
        // Try to pull from main branch first
        await git.pull('origin', 'main').catch(async () => {
          // If main branch fails, try master
          await git.pull('origin', 'master').catch(e => {
            console.warn(`Failed to pull updates for ${owner}/${repo}:`, e.message);
            // Continue even if pull fails - we still have the previous version
          });
        });
        
        console.log(`Successfully updated ${owner}/${repo}`);
      } catch (error) {
        console.error(`Error updating repository ${owner}/${repo}:`, error.message);
        // Continue with existing repo state
      }
    } else {
      console.log(`Cloning new repository: ${owner}/${repo}`);
      // Repository doesn't exist, clone it
      await simpleGit().clone(`https://github.com/${owner}/${repo}.git`, repoPath);
      console.log(`Successfully cloned ${owner}/${repo}`);
    }
    
    return {
      owner,
      repo,
      path: repoPath,
      url: repoUrl
    };
  } catch (error) {
    console.error(`Error in cloneOrUpdateRepository:`, error);
    throw error;
  }
}

/**
 * Gets information about the latest commit in a repository
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<Object>} Commit information
 */
async function getLatestCommitInfo(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const log = await git.log({ maxCount: 1 });
    
    if (log && log.latest) {
      return {
        hash: log.latest.hash,
        date: log.latest.date,
        message: log.latest.message,
        author: log.latest.author_name
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting latest commit info:`, error);
    return null;
  }
}

/**
 * Gets changes between two commits
 * @param {string} repoPath - Path to the repository
 * @param {string} fromCommit - Starting commit hash
 * @param {string} toCommit - Ending commit hash (defaults to HEAD)
 * @returns {Promise<Array>} List of changed files
 */
async function getChangedFiles(repoPath, fromCommit, toCommit = 'HEAD') {
  try {
    const git = simpleGit(repoPath);
    const diff = await git.diff([`${fromCommit}..${toCommit}`, '--name-only']);
    
    // Split the result by newlines to get individual file paths
    return diff.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error(`Error getting changed files:`, error);
    return [];
  }
}

module.exports = {
  cloneOrUpdateRepository,
  getLatestCommitInfo,
  getChangedFiles
};
