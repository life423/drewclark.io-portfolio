/**
 * GitHub Project Details Fetcher
 * 
 * This script fetches detailed information about a GitHub repository
 * and displays it in a formatted output. It can be called directly or
 * used as part of the portfolio's backend functionality.
 * 
 * Usage: node fetchProjectDetails.js [username] [repository]
 */

const { fetchGitHubRepository } = require('./github-utils');
const config = require('./config');

// Default repository to fetch if none specified
const DEFAULT_USERNAME = 'life423';
const DEFAULT_REPO = 'Ascend-Avoid';

async function main() {
    try {
        // Parse command line arguments
        const [username, repo] = process.argv.slice(2);
        
        // Use default values if not provided
        const targetUsername = username || DEFAULT_USERNAME;
        const targetRepo = repo || DEFAULT_REPO;
        
        console.log(`\nFetching details for ${targetUsername}/${targetRepo}...\n`);
        
        // Fetch repository data
        const repoData = await fetchGitHubRepository(targetUsername, targetRepo);
        
        if (!repoData) {
            console.error(`Repository ${targetUsername}/${targetRepo} not found or access denied.`);
            return;
        }
        
        // Format and display the results
        displayRepositoryDetails(repoData);
        
    } catch (error) {
        console.error('Error fetching repository details:', error.message);
        console.error('Make sure the GitHub token is configured correctly in your environment.');
    }
}

/**
 * Formats and displays repository information in a readable format
 */
function displayRepositoryDetails(repo) {
    const createdDate = new Date(repo.created_at).toLocaleDateString();
    const updatedDate = new Date(repo.updated_at).toLocaleDateString();
    
    console.log('='.repeat(80));
    console.log(`REPOSITORY: ${repo.full_name}`);
    console.log('='.repeat(80));
    console.log(`\nDescription: ${repo.description || 'No description provided'}`);
    console.log(`\nStatistics:`);
    console.log(`- Stars: ${repo.stargazers_count}`);
    console.log(`- Forks: ${repo.forks_count}`);
    console.log(`- Open Issues: ${repo.open_issues_count}`);
    console.log(`- Created: ${createdDate}`);
    console.log(`- Last Updated: ${updatedDate}`);
    console.log(`- Language: ${repo.language || 'Not specified'}`);
    
    if (repo.license) {
        console.log(`- License: ${repo.license.name}`);
    }
    
    console.log(`\nLinks:`);
    console.log(`- Repository: ${repo.html_url}`);
    console.log(`- Clone: ${repo.clone_url}`);
    
    if (repo.homepage) {
        console.log(`- Homepage: ${repo.homepage}`);
    }
    
    console.log('\nTo include this project in your portfolio, update the PROJECTS array in:');
    console.log('app/src/components/ProjectsContainer.jsx\n');
}

// Execute the main function if this script is run directly
if (require.main === module) {
    main();
}

module.exports = { 
    fetchProjectDetails: main 
};
