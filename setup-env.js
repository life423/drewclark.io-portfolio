/**
 * Environment Setup Script
 * 
 * This script creates environment files with placeholders.
 * Run it to generate the required .env files.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define environment file templates
const rootEnvTemplate = `# OpenAI API Key for portfolio website
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
`;

const apiDevEnvTemplate = `# Development Environment Configuration

# OpenAI API Key - Required for the askGPT functionality
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Other environment variables can be added below
`;

const apiProdEnvTemplate = `# Production Environment Configuration

# OpenAI API Key - Required for the askGPT functionality
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Other environment variables can be added below
`;

// File paths
const rootEnvPath = path.join(__dirname, '.env');
const apiDevEnvPath = path.join(__dirname, 'api', '.env.development');
const apiProdEnvPath = path.join(__dirname, 'api', '.env.production');

// Check if files already exist
const rootEnvExists = fs.existsSync(rootEnvPath);
const apiDevEnvExists = fs.existsSync(apiDevEnvPath);
const apiProdEnvExists = fs.existsSync(apiProdEnvPath);

console.log('Environment Setup Utility');
console.log('=========================');
console.log('This script will create environment files with placeholders for your API keys.');
console.log('You can then edit these files to add your actual API keys.');
console.log('');

// Function to prompt for OpenAI API key
function promptForApiKey() {
  return new Promise((resolve) => {
    rl.question('Enter your OpenAI API key (leave blank to use placeholders): ', (answer) => {
      resolve(answer.trim() || 'your_openai_api_key_here');
    });
  });
}

// Function to write environment files
function writeEnvFiles(apiKey) {
  try {
    // Replace placeholder with actual API key if provided
    const rootEnv = rootEnvTemplate.replace('your_openai_api_key_here', apiKey);
    const apiDevEnv = apiDevEnvTemplate.replace('your_openai_api_key_here', apiKey);
    const apiProdEnv = apiProdEnvTemplate.replace('your_openai_api_key_here', apiKey);

    // Write root .env file
    if (!rootEnvExists || promptOverwrite('.env')) {
      fs.writeFileSync(rootEnvPath, rootEnv);
      console.log('Created .env file in root directory');
    }

    // Create api directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'api'))) {
      fs.mkdirSync(path.join(__dirname, 'api'), { recursive: true });
    }

    // Write API development .env file
    if (!apiDevEnvExists || promptOverwrite('api/.env.development')) {
      fs.writeFileSync(apiDevEnvPath, apiDevEnv);
      console.log('Created .env.development file in api directory');
    }

    // Write API production .env file
    if (!apiProdEnvExists || promptOverwrite('api/.env.production')) {
      fs.writeFileSync(apiProdEnvPath, apiProdEnv);
      console.log('Created .env.production file in api directory');
    }

    console.log('');
    console.log('Environment files created successfully.');
    console.log('IMPORTANT: These files contain sensitive information and should not be committed to version control.');
    console.log('They are already added to .gitignore, but please verify they will not be committed.');

  } catch (error) {
    console.error('Error creating environment files:', error.message);
  } finally {
    rl.close();
  }
}

function promptOverwrite(filename) {
  // Simple implementation - in a real script, this would be interactive
  console.log(`Note: ${filename} already exists and will be skipped.`);
  return false;
}

// Main execution
async function main() {
  const apiKey = await promptForApiKey();
  writeEnvFiles(apiKey);
}

main();
