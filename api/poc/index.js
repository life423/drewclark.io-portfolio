/**
 * Main Entry Point for Code Embedding POC
 * 
 * This file provides an overview of the POC and exports
 * all the main components for easy access.
 */

const codeParser = require('./code-parser');
const embeddings = require('./embeddings');
const vectorStore = require('./vector-store');
const askgptIntegration = require('./askgpt-integration');

console.log(`
======================================
   Code Embedding Database POC
======================================

This Proof of Concept demonstrates how to use embeddings
to enhance ChatGPT's ability to answer questions about
code repositories without relying on GitHub API access.

Components:

1. Code Parser (code-parser.js)
   - Extracts code segments from repository files
   - Identifies functions, classes, methods, etc.

2. Embeddings Service (embeddings.js)
   - Generates vector embeddings for code segments
   - Stores embeddings in local JSON files

3. Vector Store (vector-store.js)
   - Provides similarity search for code snippets
   - Uses cosine similarity to find relevant code

4. askGPT Integration (askgpt-integration.js)
   - Enhances questions with relevant code context
   - Shows how to integrate with the existing API

Usage:

1. Process a repository:
   node process-repo.js <github-url> <local-repo-path>

2. Query for relevant code:
   node query.js <owner/repo> <question>

3. View integration example with askGPT:
   See askgpt-integration.js for implementation details

For detailed usage instructions, run each script with --help
or without arguments for interactive mode.
`);

module.exports = {
  codeParser,
  embeddings,
  vectorStore,
  askgptIntegration
};

/**
 * Getting Started Guide
 * 
 * To use this POC:
 * 
 * 1. Install required dependencies:
 *    npm install openai glob
 * 
 * 2. Set your OpenAI API key in api/config.js or in an environment variable:
 *    OPENAI_API_KEY=your-api-key
 * 
 * 3. Create the data directory for storing embeddings:
 *    mkdir -p data/embeddings
 * 
 * 4. Process a repository to generate embeddings:
 *    node api/poc/process-repo.js https://github.com/user/repo ./path/to/local/repo
 * 
 * 5. Test querying code with a question:
 *    node api/poc/query.js user/repo "How does the authentication system work?"
 * 
 * 6. Integrate with askGPT by following instructions in askgpt-integration.js
 */
