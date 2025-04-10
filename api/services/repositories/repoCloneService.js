/**
 * Repository Clone Service
 * 
 * Handles cloning and updating repositories from GitHub for code analysis.
 */
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const rimraf = require('rimraf');
const { getRepositoryPath, ensureRepoStorage, repositoryExists } = require('./repoStorageService');
const { extractRepoInfo } = require('../../github-utils');

// Timeout for git operations (5 minutes)
const GIT_OPERATION_TIMEOUT = 300000;

/**
 * Recursively removes a directory and its contents
 * @param {string} dirPath - Path to the directory to delete
 */
async function cleanDirectory(dirPath) {
  try {
    // Check if directory exists first
    const exists = fsSync.existsSync(dirPath);
    if (exists) {
      console.log(`Cleaning up directory: ${dirPath}`);
      
      // Use rimraf as a callback function
      return new Promise((resolve, reject) => {
        rimraf(dirPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error(`Error cleaning directory ${dirPath}:`, error);
    // Continue execution despite error
  }
}

/**
 * Clones or updates a repository from GitHub
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<{owner: string, repo: string, path: string}>} Repository info
 */
async function cloneOrUpdateRepository(repoUrl) {
  let repoInfo = null;
  let repoPath = null;
  
  try {
    // Extract repository information from URL
    repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      throw new Error(`Invalid repository URL: ${repoUrl}`);
    }
    
    const { owner, repo } = repoInfo;
    
    // Ensure storage directory exists
    await ensureRepoStorage();
    
    // Get path for this repository
    repoPath = getRepositoryPath(owner, repo);
    
    // Check if repository already exists
    const exists = await repositoryExists(owner, repo);
    
    if (exists) {
      console.log(`Updating existing repository: ${owner}/${repo}`);
      // Repository exists, update it
      const git = simpleGit({
        baseDir: repoPath,
        binary: 'git',
        maxConcurrentProcesses: 1,
        trimmed: false,
        timeout: {
          block: GIT_OPERATION_TIMEOUT
        }
      });
      
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
      // If a failed clone left a partial directory, clean it up first
      await cleanDirectory(repoPath);
      
      console.log(`Cloning new repository: ${owner}/${repo}`);
      // Repository doesn't exist, clone it
      const git = simpleGit({
        binary: 'git',
        maxConcurrentProcesses: 1,
        trimmed: false,
        timeout: {
          block: GIT_OPERATION_TIMEOUT
        }
      });
      
      try {
        // Create parent directory if it doesn't exist
        const parentDir = path.dirname(repoPath);
        await fs.mkdir(parentDir, { recursive: true });
        
        // Clone with timeout
        await git.clone(`https://github.com/${owner}/${repo}.git`, repoPath);
        console.log(`Successfully cloned ${owner}/${repo}`);
      } catch (error) {
        console.error(`Error cloning repository ${owner}/${repo}:`, error);
        // Clean up any partial clone
        await cleanDirectory(repoPath);
        throw error;
      }
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
