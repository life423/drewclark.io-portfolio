/**
 * Repository Discovery Service
 * 
 * Identifies GitHub repositories mentioned in the portfolio's project data
 * and maintains a list of repositories to be processed.
 */
const fs = require('fs').promises;
const path = require('path');
const { extractRepoInfo } = require('../../github-utils');

// Path to store the list of known repositories
const KNOWN_REPOS_FILE = path.join(__dirname, '../../../data/git_repos.txt');

/**
 * Reads git_repos.txt file if it exists
 * @returns {Promise<string[]>} Array of repository URLs
 */
async function getKnownRepositories() {
  try {
    // Ensure the data directory exists
    const dataDir = path.dirname(KNOWN_REPOS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Try to read from a predefined list
    try {
      const content = await fs.readFile(KNOWN_REPOS_FILE, 'utf-8');
      
      if (content) {
        return content.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));
      }
    } catch (readError) {
      // File doesn't exist yet, that's okay
      console.log('No existing repositories file found, will create one.');
    }
    
    // Default: always include the portfolio repository itself
    const defaultRepos = ['https://github.com/life423/drewclark.io-portfolio'];
    
    // Write the default repos to the file
    await fs.writeFile(KNOWN_REPOS_FILE, defaultRepos.join('\n'));
    
    return defaultRepos;
  } catch (error) {
    console.error('Error reading known repositories:', error);
    // Return the portfolio repo as a fallback
    return ['https://github.com/life423/drewclark.io-portfolio'];
  }
}

/**
 * Saves a list of repository URLs to the known repositories file
 * @param {string[]} repoUrls - Array of repository URLs
 * @returns {Promise<boolean>} Success status
 */
async function saveKnownRepositories(repoUrls) {
  try {
    // Ensure the data directory exists
    const dataDir = path.dirname(KNOWN_REPOS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Filter out duplicates and empty entries
    const uniqueRepos = [...new Set(repoUrls.filter(url => url && url.trim()))];
    
    // Write to file with a header comment
    const content = 
      '# List of GitHub repositories to process\n' +
      '# This file is automatically updated by the repoDiscoveryService\n' +
      uniqueRepos.join('\n');
    
    await fs.writeFile(KNOWN_REPOS_FILE, content);
    console.log(`Saved ${uniqueRepos.length} repositories to ${KNOWN_REPOS_FILE}`);
    
    return true;
  } catch (error) {
    console.error('Error saving known repositories:', error);
    return false;
  }
}

/**
 * Extracts GitHub repository URLs from project data
 * @param {Array} projects - Project data array
 * @returns {Array<string>} Repository URLs
 */
function extractRepositoriesFromProjects(projects) {
  if (!Array.isArray(projects)) {
    console.warn('Projects is not an array:', typeof projects);
    return [];
  }
  
  const repoUrls = new Set();
  
  // Always include the portfolio repo itself
  repoUrls.add('https://github.com/life423/drewclark.io-portfolio');
  
  // Helper to extract URLs from text
  const extractUrlsFromText = (text) => {
    if (!text || typeof text !== 'string') return;
    
    const githubUrlPattern = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g;
    const matches = text.match(githubUrlPattern) || [];
    
    matches.forEach(url => repoUrls.add(url));
  };
  
  // Process each project
  projects.forEach(project => {
    // Check various fields for GitHub URLs
    const fieldsToCheck = [
      'readme', 'technicalDetails', 'detailedDescription', 
      'initialDescription', 'summary', 'description'
    ];
    
    fieldsToCheck.forEach(field => {
      if (project[field]) {
        extractUrlsFromText(project[field]);
      }
    });
  });
  
  return [...repoUrls];
}

/**
 * Updates the known repositories list with newly discovered repositories
 * @param {Array} projects - Project data array
 * @returns {Promise<string[]>} Updated list of repository URLs
 */
async function updateKnownRepositories(projects) {
  try {
    // Get existing known repositories
    const existingRepos = await getKnownRepositories();
    
    // Extract repositories from projects
    const discoveredRepos = extractRepositoriesFromProjects(projects);
    
    // Combine existing and discovered repositories
    const allRepos = [...new Set([...existingRepos, ...discoveredRepos])];
    
    // Save the updated list
    await saveKnownRepositories(allRepos);
    
    return allRepos;
  } catch (error) {
    console.error('Error updating known repositories:', error);
    return [];
  }
}

module.exports = {
  getKnownRepositories,
  saveKnownRepositories,
  extractRepositoriesFromProjects,
  updateKnownRepositories
};
