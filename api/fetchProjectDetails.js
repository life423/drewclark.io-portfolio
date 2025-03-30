#!/usr/bin/env node

/**
 * Fetch GitHub Project Details
 * 
 * This script fetches repository information from GitHub's API and
 * displays it in a clean, formatted way.
 */
const axios = require('axios');
const config = require('./config');
const { extractRepoInfo } = require('./github-utils');

// GitHub API configuration
const GITHUB_TOKEN = config.githubToken;
const GITHUB_API = 'https://api.github.com';

// GitHub API client with authentication
const githubClient = axios.create({
  baseURL: GITHUB_API,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
  },
  timeout: 10000 // 10 second timeout
});

/**
 * Get repository details from GitHub
 * @param {string} owner - Repository owner/organization
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository details
 */
async function getRepositoryDetails(owner, repo) {
  try {
    // Fetch basic repository info
    const repoResponse = await githubClient.get(`/repos/${owner}/${repo}`);
    const repoData = repoResponse.data;

    // Fetch latest commit
    const commitsResponse = await githubClient.get(`/repos/${owner}/${repo}/commits`, {
      params: { per_page: 1 }
    });
    const latestCommit = commitsResponse.data[0] || {};

    // Fetch open issues (excluding PRs)
    const issuesResponse = await githubClient.get('/search/issues', {
      params: {
        q: `repo:${owner}/${repo} is:issue is:open`,
      }
    });
    const openIssuesCount = issuesResponse.data.total_count;

    // Fetch open PRs
    const prsResponse = await githubClient.get('/search/issues', {
      params: {
        q: `repo:${owner}/${repo} is:pr is:open`,
      }
    });
    const openPRsCount = prsResponse.data.total_count;

    return {
      name: repoData.name,
      description: repoData.description || 'No description provided',
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: openIssuesCount,
      openPRs: openPRsCount,
      updatedAt: repoData.updated_at,
      latestCommit: {
        message: latestCommit.commit?.message?.split('\n')[0] || 'No commits found',
        sha: latestCommit.sha || 'Not available',
        date: latestCommit.commit?.author?.date
      }
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Handle API errors with clear messages
 * @param {Error} error - The error object
 * @returns {Error} Error with clear message
 */
function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    
    if (status === 404) {
      return new Error('Repository not found. Please check the owner/repo name.');
    } else if (status === 401 || status === 403) {
      return new Error('GitHub API access denied. Check your token or permissions.');
    } else {
      return new Error(`GitHub API error: ${status} - ${error.response.data.message || 'Unknown error'}`);
    }
  }
  
  // Network or other errors
  return new Error(`Connection error: ${error.message}`);
}

/**
 * Get repository owner and name from arguments or package.json
 * @returns {Promise<{owner: string, repo: string}>} Repository info
 */
async function getRepositoryInfo() {
  // Check command line arguments
  const [,, argOwner, argRepo] = process.argv;
  
  if (argOwner && argRepo) {
    return { owner: argOwner, repo: argRepo };
  }
  
  // Try to get from environment variables
  const envOwner = process.env.GITHUB_REPO_OWNER;
  const envRepo = process.env.GITHUB_REPO_NAME;
  
  if (envOwner && envRepo) {
    return { owner: envOwner, repo: envRepo };
  }
  
  // Try to extract from package.json
  try {
    const fs = require('fs');
    const path = require('path');
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);
      
      if (packageJson.repository && packageJson.repository.url) {
        const repoInfo = extractRepoInfo(packageJson.repository.url);
        if (repoInfo) {
          return repoInfo;
        }
      }
    }
  } catch (error) {
    console.error('Error reading package.json:', error.message);
  }
  
  throw new Error(
    'Repository information not found.\n' +
    'Please provide via arguments: node fetchProjectDetails.js <owner> <repo>\n' +
    'Or set GITHUB_REPO_OWNER and GITHUB_REPO_NAME environment variables.'
  );
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return dateString;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get repository info
    const { owner, repo } = await getRepositoryInfo();
    
    // Fetch repository details
    const details = await getRepositoryDetails(owner, repo);
    
    // Display results
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Repository: ${owner}/${details.name}`);
    console.log(`${'='.repeat(50)}\n`);
    
    console.log(`Description    : ${details.description}`);
    console.log(`Stars          : ${details.stars}`);
    console.log(`Forks          : ${details.forks}`);
    console.log(`Open Issues    : ${details.openIssues}`);
    console.log(`Open PRs       : ${details.openPRs}`);
    console.log(`Latest Commit  : ${details.latestCommit.message}`);
    console.log(`Commit SHA     : ${details.latestCommit.sha}`);
    console.log(`Commit Date    : ${formatDate(details.latestCommit.date)}`);
    console.log(`Last Updated   : ${formatDate(details.updatedAt)}`);
    console.log(`\n${'='.repeat(50)}\n`);
    
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

// Execute main function
main();
