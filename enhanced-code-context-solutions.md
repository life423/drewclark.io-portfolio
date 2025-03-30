# Enhanced Code Context Solutions

Below are 5 innovative approaches to dramatically improve ChatGPT's ability to understand and answer questions about code repositories beyond what GitHub token access allows.

## 1. Code Repository Mirroring System

### Overview
Create a local or cloud-based mirror of your repositories with comprehensive indexing and enhanced metadata.

### Implementation
```javascript
// api/services/codeRepository/syncService.js
const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { parseCodeStructure } = require('./codeParser');
const { extractMetadata } = require('./metadataExtractor');

// Directory for storing mirrored repositories
const REPO_STORAGE_DIR = path.join(__dirname, '../../../data/repos');

/**
 * Syncs a GitHub repository to local storage and processes it
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<string>} Path to the mirrored repository
 */
async function syncRepository(repoUrl) {
  try {
    // Extract owner and repo name
    const { owner, repo } = extractRepoInfo(repoUrl);
    if (!owner || !repo) {
      throw new Error(`Invalid repository URL: ${repoUrl}`);
    }
    
    const repoDir = path.join(REPO_STORAGE_DIR, `${owner}-${repo}`);
    
    // Check if directory exists
    try {
      await fs.access(repoDir);
      // If it exists, do a git pull to update
      await executeCommand(`cd ${repoDir} && git pull`);
    } catch {
      // Directory doesn't exist, clone the repo
      await fs.mkdir(REPO_STORAGE_DIR, { recursive: true });
      await executeCommand(`git clone ${repoUrl} ${repoDir}`);
    }
    
    // Process and index the repository
    await processRepository(repoDir, owner, repo);
    
    return repoDir;
  } catch (error) {
    console.error(`Error syncing repository: ${error.message}`);
    throw error;
  }
}

/**
 * Process a repository to extract code structure and metadata
 */
async function processRepository(repoDir, owner, repo) {
  // Parse code structure (classes, functions, etc.)
  const codeStructure = await parseCodeStructure(repoDir);
  
  // Extract metadata (dependencies, complexity metrics, etc.)
  const metadata = await extractMetadata(repoDir);
  
  // Save processed data to database or file system
  await saveProcessedData(owner, repo, codeStructure, metadata);
  
  // Generate documentation summaries
  await generateDocumentation(repoDir, codeStructure, metadata);
}

// Helper function to execute shell commands
async function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  syncRepository
};
```

### API Implementation
Create a route that serves the mirrored repository data:

```javascript
// api/routes.js - Add this route
router.post('/repository-data', async (req, res) => {
  try {
    const { repoUrl, query } = req.body;
    
    // Get repository data (from mirror)
    const repoData = await codeRepositoryService.getRepositoryData(repoUrl, query);
    
    res.json({
      success: true,
      data: repoData
    });
  } catch (error) {
    console.error(`Error retrieving repository data: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Benefits
- No dependency on GitHub API rate limits
- Enriched code structure metadata not available via GitHub API
- Full code access without token permission issues
- One-time or scheduled syncs instead of real-time API calls
- Lower latency when analyzing code

## 2. Intelligent Code Context Expansion

### Overview
Implement a system that analyzes code being questioned and automatically expands the context with related files/components.

### Implementation
```javascript
// api/services/contextExpansion/contextService.js
const fs = require('fs/promises');
const path = require('path');
const { parseImports } = require('./importParser');
const { analyzeDependencies } = require('./dependencyAnalyzer');

/**
 * Expands the context around a file to include related components
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the file being questioned
 * @param {number} depth - How many levels of dependencies to include
 * @returns {Promise<object>} Expanded context data
 */
async function expandFileContext(repoPath, filePath, depth = 1) {
  try {
    const fullPath = path.join(repoPath, filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    
    // Start with the requested file
    const context = {
      primary: {
        path: filePath,
        content: fileContent
      },
      imports: [],
      importedBy: [],
      related: []
    };
    
    // Parse imports in the file
    const imports = await parseImports(fileContent, path.extname(filePath));
    
    // For each import, add the file content (up to a reasonable depth)
    if (depth > 0) {
      for (const importPath of imports) {
        try {
          // Resolve relative paths
          const resolvedPath = resolveImportPath(importPath, filePath, repoPath);
          if (resolvedPath) {
            const importContent = await fs.readFile(resolvedPath, 'utf-8');
            context.imports.push({
              path: path.relative(repoPath, resolvedPath),
              content: importContent
            });
            
            // Recursive call with decreased depth
            if (depth > 1) {
              const nestedContext = await expandFileContext(
                repoPath, 
                path.relative(repoPath, resolvedPath), 
                depth - 1
              );
              context.related.push(...nestedContext.imports);
            }
          }
        } catch (importError) {
          console.warn(`Could not resolve import ${importPath}: ${importError.message}`);
        }
      }
    }
    
    // Find files that import this file (reverse dependencies)
    const importedBy = await findFilesImporting(repoPath, filePath);
    context.importedBy = importedBy.map(file => ({
      path: file,
      // We could also load content here, but might lead to too much data
      relationship: 'imports the primary file'
    }));
    
    return context;
  } catch (error) {
    console.error(`Error expanding context for ${filePath}: ${error.message}`);
    throw error;
  }
}

// Helper to resolve import paths based on file type
function resolveImportPath(importPath, currentFilePath, repoPath) {
  // Implementation depends on programming language and module system
  // This is a simplified example
  
  // Handle different import formats by language...
  
  return path.resolve(repoPath, importPath);
}

// Find files that import the given file
async function findFilesImporting(repoPath, targetFilePath) {
  // This would require a pre-built index of imports across the codebase
  // For a real implementation, you might use a tool like jscodeshift or AST parsers
  
  // Placeholder implementation
  return [];
}

module.exports = {
  expandFileContext
};
```

### API Integration
```javascript
// In your askGPT processing function, add:

async function enhanceWithCodeContext(question, repoPath) {
  // Extract file path from question
  const filePathMatch = question.match(/about\s+["`'](.+?)["`']/i) || 
                      question.match(/in\s+["`'](.+?)["`']/i) ||
                      question.match(/file\s+["`'](.+?)["`']/i);
  
  if (filePathMatch && filePathMatch[1]) {
    const filePath = filePathMatch[1];
    try {
      // Get expanded context
      const expandedContext = await contextService.expandFileContext(repoPath, filePath, 2);
      
      // Format the context to include in the question
      let contextText = `
PRIMARY FILE: ${expandedContext.primary.path}
\`\`\`
${expandedContext.primary.content}
\`\`\`

IMPORTED FILES:
${expandedContext.imports.map(file => `
- ${file.path}
\`\`\`
${file.content.substring(0, 500)}${file.content.length > 500 ? '...(truncated)' : ''}
\`\`\`
`).join('\n')}

FILES THAT IMPORT ${expandedContext.primary.path}:
${expandedContext.importedBy.map(file => `- ${file.path}`).join('\n')}
`;

      return `${question}\n\nCODE CONTEXT:\n${contextText}`;
    } catch (error) {
      console.error(`Error enhancing with code context: ${error.message}`);
    }
  }
  
  return question;
}
```

### Benefits
- Provides related context automatically without user having to specify
- Surfaces non-obvious code relationships
- Reduces questions about imports or dependencies
- Gives AI deeper understanding of code architecture
- Works with any code repository, not just GitHub

## 3. Code Embedding Database

### Overview
Build a vector embedding database of your code for semantic search and retrieval.

### Implementation
First, install necessary packages:
```bash
npm install openai @pinecone-database/pinecone
```

Create the embedding service:
```javascript
// api/services/embeddings/embeddingService.js
const fs = require('fs/promises');
const path = require('path');
const glob = require('glob');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { parseCodeIntoFunctions } = require('./codeParser');
const config = require('../../config');

const openai = new OpenAI({ apiKey: config.openAiApiKey });
const pinecone = new Pinecone({
  apiKey: config.pineconeApiKey,
  environment: config.pineconeEnvironment
});
const index = pinecone.index('code-embeddings');

/**
 * Process repository to embed code segments in vector database
 * @param {string} repoPath - Path to the repository
 */
async function processRepositoryEmbeddings(repoPath, owner, repo) {
  try {
    // Find all code files
    const codeFiles = await findCodeFiles(repoPath);
    
    // Process each file
    let processedCount = 0;
    for (const filePath of codeFiles) {
      await processFileEmbeddings(filePath, repoPath, owner, repo);
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${codeFiles.length} files`);
      }
    }
    
    console.log(`Completed embedding ${processedCount} files from ${owner}/${repo}`);
  } catch (error) {
    console.error(`Error processing repository embeddings: ${error.message}`);
    throw error;
  }
}

/**
 * Process a single file for embeddings
 */
async function processFileEmbeddings(filePath, repoPath, owner, repo) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(repoPath, filePath);
    
    // Parse file into logical segments (functions, classes, etc.)
    const segments = parseCodeIntoFunctions(content, path.extname(filePath));
    
    // Generate embeddings for each segment
    for (const segment of segments) {
      const embedding = await generateEmbedding(segment.code);
      
      // Store in vector database
      await index.upsert({
        vectors: [{
          id: `${owner}-${repo}-${relativePath}-${segment.name}`,
          values: embedding,
          metadata: {
            owner,
            repo,
            path: relativePath,
            type: segment.type, // function, class, method, etc.
            name: segment.name,
            code: segment.code,
            startLine: segment.startLine,
            endLine: segment.endLine
          }
        }]
      });
    }
    
    // Also store whole file for context
    const fileEmbedding = await generateEmbedding(content.substring(0, 8000)); // Limit size
    await index.upsert({
      vectors: [{
        id: `${owner}-${repo}-${relativePath}-file`,
        values: fileEmbedding,
        metadata: {
          owner,
          repo,
          path: relativePath,
          type: 'file',
          name: path.basename(filePath),
          code: content.length > 10000 ? content.substring(0, 10000) + '...(truncated)' : content,
          language: identifyLanguage(filePath)
        }
      }]
    });
  } catch (error) {
    console.error(`Error processing file embeddings for ${filePath}: ${error.message}`);
  }
}

// Generate vector embedding for code
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  
  return response.data[0].embedding;
}

// Find relevant code for a question using vector similarity
async function findRelevantCode(question, owner, repo, limit = 5) {
  try {
    // Generate embedding for question
    const questionEmbedding = await generateEmbedding(question);
    
    // Query vector database
    const results = await index.query({
      vector: questionEmbedding,
      filter: { owner, repo },
      topK: limit,
      includeMetadata: true
    });
    
    return results.matches.map(match => ({
      path: match.metadata.path,
      type: match.metadata.type,
      name: match.metadata.name,
      code: match.metadata.code,
      similarity: match.score
    }));
  } catch (error) {
    console.error(`Error finding relevant code: ${error.message}`);
    return [];
  }
}

module.exports = {
  processRepositoryEmbeddings,
  findRelevantCode
};
```

### API Integration
```javascript
// In your askGPT processing function, add:

async function enhanceWithEmbeddedCode(question, repoUrl) {
  try {
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) return question;
    
    const { owner, repo } = repoInfo;
    
    // Find most relevant code for this question
    const relevantCode = await embeddingService.findRelevantCode(question, owner, repo, 5);
    
    if (relevantCode.length === 0) return question;
    
    // Format the relevant code as context
    let codeContext = `RELEVANT CODE SEGMENTS:\n\n`;
    
    relevantCode.forEach(segment => {
      codeContext += `File: ${segment.path}\n`;
      codeContext += `${segment.type}: ${segment.name}\n`;
      codeContext += "```\n";
      codeContext += segment.code;
      codeContext += "\n```\n\n";
    });
    
    return `${question}\n\n${codeContext}`;
  } catch (error) {
    console.error(`Error enhancing with embedded code: ${error.message}`);
    return question;
  }
}
```

### Benefits
- Semantic understanding of code rather than keyword matching
- Works even with limited token capacity by retrieving only the most relevant snippets
- Scales to massive codebases efficiently
- Can find relevant code even when the user doesn't know where to look
- Improves over time with better embedding models

## 4. Autonomous Code Documentation Generator

### Overview
Create an AI-powered documentation generator that runs locally and pre-processes code into detailed explanations.

### Implementation
```javascript
// api/services/documentation/documentationGenerator.js
const fs = require('fs/promises');
const path = require('path');
const { OpenAI } = require('openai');
const { parseCodeStructure } = require('../codeRepository/codeParser');
const config = require('../../config');

const openai = new OpenAI({ apiKey: config.openAiApiKey });
const docsOutputDir = path.join(__dirname, '../../../data/generated-docs');

/**
 * Generate comprehensive documentation for a repository
 * @param {string} repoPath - Path to the repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
async function generateRepositoryDocumentation(repoPath, owner, repo) {
  try {
    // Create output directory
    const outputDir = path.join(docsOutputDir, `${owner}-${repo}`);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Parse overall code structure
    const codeStructure = await parseCodeStructure(repoPath);
    
    // Generate architecture documentation
    await generateArchitectureDoc(repoPath, codeStructure, outputDir);
    
    // Generate design pattern documentation
    await generateDesignPatternDoc(repoPath, codeStructure, outputDir);
    
    // Generate documentation for key components
    await generateComponentsDocs(repoPath, codeStructure, outputDir);
    
    // Create index file
    await generateDocIndex(owner, repo, outputDir, codeStructure);
    
    return outputDir;
  } catch (error) {
    console.error(`Error generating repository documentation: ${error.message}`);
    throw error;
  }
}

/**
 * Generate architecture documentation
 */
async function generateArchitectureDoc(repoPath, codeStructure, outputDir) {
  try {
    // Generate a system architecture overview using AI
    const directoryStructure = await generateDirectoryTree(repoPath);
    const keyComponents = extractKeyComponents(codeStructure);
    
    const prompt = `
You are an expert software architect. Analyze the following repository structure and provide a comprehensive 
architectural overview of the system. Focus on the main components, their responsibilities, and how they interact.

Directory Structure:
${directoryStructure}

Key Components:
${JSON.stringify(keyComponents, null, 2)}

Provide the following:
1. Overall architecture pattern (MVC, microservices, etc.)
2. Main components and their responsibilities
3. Data flow between components
4. Any design patterns identified
5. Architectural strengths and potential weaknesses
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert software architect and technical writer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    const architectureDoc = response.choices[0].message.content;
    
    // Save to file
    await fs.writeFile(
      path.join(outputDir, 'architecture-overview.md'),
      `# System Architecture Overview\n\n${architectureDoc}`
    );
    
  } catch (error) {
    console.error(`Error generating architecture doc: ${error.message}`);
  }
}

// More implementation functions...

/**
 * Generate documentation for a specific file
 */
async function generateFileDocumentation(filePath, repoPath, outputDir) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(repoPath, filePath);
    const language = identifyLanguage(filePath);
    
    // Skip files that are too large
    if (content.length > 20000) {
      console.log(`Skipping ${relativePath} - too large (${content.length} chars)`);
      return;
    }
    
    // Skip binary files
    if (isBinaryFile(filePath, content)) {
      return;
    }
    
    const prompt = `
Analyze the following ${language} code file and provide detailed documentation:

FILE: ${relativePath}

\`\`\`${language}
${content}
\`\`\`

Provide:
1. Overall purpose of this file
2. Detailed descriptions of all functions/classes/methods
3. Key algorithms and data structures used
4. Dependencies and interactions with other components
5. Any notable patterns or techniques used
6. Potential edge cases or performance considerations
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert software developer and technical writer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    const fileDoc = response.choices[0].message.content;
    
    // Create directory structure matching the original repo
    const outputFilePath = path.join(outputDir, 'files', relativePath.replace(/\.[^/.]+$/, '.md'));
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    
    // Save to file
    await fs.writeFile(
      outputFilePath,
      `# ${path.basename(filePath)} Documentation\n\n${fileDoc}`
    );
    
  } catch (error) {
    console.error(`Error generating file documentation for ${filePath}: ${error.message}`);
  }
}

module.exports = {
  generateRepositoryDocumentation,
  generateFileDocumentation
};
```

### API Integration
```javascript
// In your askGPT processing function, add:

async function enhanceWithGeneratedDocs(question, repoUrl) {
  try {
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) return question;
    
    const { owner, repo } = repoInfo;
    
    // Check if we have generated docs
    const docsDir = path.join(__dirname, '../../../data/generated-docs', `${owner}-${repo}`);
    
    try {
      await fs.access(docsDir);
    } catch {
      // No docs available
      return question;
    }
    
    // Find relevant documentation based on the question
    const relevantDocs = await findRelevantDocs(docsDir, question);
    
    if (relevantDocs.length === 0) return question;
    
    // Format the documentation as context
    let docsContext = `GENERATED DOCUMENTATION:\n\n`;
    
    for (const doc of relevantDocs) {
      const content = await fs.readFile(doc.path, 'utf-8');
      docsContext += `--- ${doc.title} ---\n\n`;
      docsContext += content.slice(0, 2000) + (content.length > 2000 ? '...(truncated)' : '');
      docsContext += '\n\n';
    }
    
    return `${question}\n\n${docsContext}`;
  } catch (error) {
    console.error(`Error enhancing with generated docs: ${error.message}`);
    return question;
  }
}
```

### Benefits
- No real-time API rate limits since documentation is pre-generated
- Deeper analysis of code than GitHub README
- Focuses on architectural insights that simple code viewing doesn't provide
- Can generate documentation that doesn't exist in the source repository
- Includes design decisions and implementation rationales

## 5. Multi-Source Knowledge Integration System

### Overview
Build a comprehensive system that combines multiple knowledge sources dynamically based on the question.

### Implementation
```javascript
// api/services/knowledgeIntegration/knowledgeService.js
const { findRelevantCode } = require('../embeddings/embeddingService');
const { expandFileContext } = require('../contextExpansion/contextService');
const { extractRepoInfo } = require('../../github-utils');
const { fetchRepositoryDocs } = require('../../github-utils');
const { findRelevantDocs } = require('../documentation/documentationSearch');
const fs = require('fs/promises');
const path = require('path');

/**
 * Enhances a question with integrated knowledge from multiple sources
 * @param {string} question - Original user question
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<string>} Enhanced question
 */
async function enhanceWithIntegratedKnowledge(question, repoUrl) {
  try {
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) return question;
    
    const { owner, repo } = repoInfo;
    
    // Determine which types of knowledge would be most relevant for this question
    const relevanceScores = analyzeQuestionRelevance(question);
    
    // Sort knowledge sources by relevance
    const rankedSources = Object.entries(relevanceScores)
      .sort((a, b) => b[1] - a[1])
      .map(([source]) => source);
    
    // Initialize context parts
    let enhancedContext = '';
    let currentTokenCount = estimateTokens(question);
    const MAX_TOKENS = 6000; // Leave room for the response
    
    // Get repository path for local operations
    const repoPath = await getLocalRepoPath(owner, repo);
    
    // Add knowledge from each source, prioritized by relevance
    for (const source of rankedSources) {
      if (currentTokenCount >= MAX_TOKENS) break;
      
      let sourceContent = '';
      let sourceTokens = 0;
      
      // Get content from each knowledge source
      switch (source) {
        case 'codeEmbeddings':
          if (repoPath) {
            const relevantCode = await findRelevantCode(question, owner, repo, 3);
            sourceContent = formatRelevantCodeContext(relevantCode);
            sourceTokens = estimateTokens(sourceContent);
          }
          break;
          
        case 'githubDocs':
          try {
            const githubContent = await fetchRepositoryDocs(repoUrl);
            const filteredContent = filterMostRelevantContent(githubContent, question, 1500);
            sourceContent = `GITHUB DOCUMENTATION:\n\n${filteredContent}`;
            sourceTokens = estimateTokens(sourceContent);
          } catch (error) {
            console.log(`GitHub docs unavailable: ${error.message}`);
          }
          break;
          
        case 'generatedDocs':
          if (repoPath) {
            const docsDir = path.join(__dirname, '../../../data/generated-docs', `${owner}-${repo}`);
            try {
              await fs.access(docsDir);
              const relevantDocs = await findRelevantDocs(docsDir, question, 2);
              sourceContent = formatRelevantDocsContext(relevantDocs);
              sourceTokens = estimateTokens(sourceContent);
            } catch (error) {
              console.log(`Generated docs unavailable: ${error.message}`);
            }
          }
          break;
          
        case 'codeContext':
          if (repoPath) {
            const filePathMatch = question.match(/about\s+["`'](.+?)["`']/i) || 
                              question.match(/in\s+["`'](.+?)["`']/i) ||
                              question.match(/file\s+["`'](.+?)["`']/i);
            
            if (filePathMatch && filePathMatch[1]) {
              const filePath = filePathMatch[1];
              try {
                const expandedContext = await expandFileContext(repoPath, filePath, 1);
                sourceContent = formatExpandedContext(expandedContext);
                sourceTokens = estimateTokens(sourceContent);
              } catch (error) {
                console.log(`Code context unavailable: ${error.message}`);
              }
            }
          }
          break;
          
        // Add cases for other knowledge sources
      }
      
      // Add this source if it fits within token limit
      if (sourceContent && currentTokenCount + sourceTokens <= MAX_TOKENS) {
        enhancedContext += `\n\n${sourceContent}`;
        currentTokenCount += sourceTokens;
      }
    }
    
    if (enhancedContext) {
      return `${question}\n\nKNOWLEDGE CONTEXT:${enhancedContext}`;
    }
    
    return question;
  } catch (error) {
    console.error(`Error enhancing with integrated knowledge: ${error.message}`);
    return question;
  }
}

/**
 * Analyzes question to determine relevance of different knowledge sources
 */
function analyzeQuestionRelevance(question) {
  const questionLower = question.toLowerCase();
  
  // Initialize scores for different knowledge sources
  const scores = {
    codeEmbeddings: 0,
    githubDocs: 0,
    generatedDocs: 0,
    codeContext: 0,
    commitHistory: 0,
    testCases: 0
  };
  
  // Check for keywords that indicate which sources would be most helpful
  if (questionLower.includes('how') || 
      questionLower.includes('implement') || 
      questionLower.includes('function')) {
    scores.codeEmbeddings += 3;
    scores.codeContext += 2;
  }
  
  if (questionLower.includes('architecture') || 
      questionLower.includes('design') || 
      questionLower.includes('pattern')) {
    scores.generatedDocs += 3;
    scores.codeEmbeddings += 1;
  }
  
  if (questionLower.includes('documentation') || 
      questionLower.includes('readme') || 
      questionLower.includes('overview')) {
    scores.githubDocs += 3;
    scores.generatedDocs += 2;
  }
  
  if (questionLower.includes('file') || 
      questionLower.includes('import') || 
      questionLower.includes('depend')) {
    scores.codeContext += 3;
  }
  
  if (questionLower.includes('test') || 
      questionLower.includes('spec') || 
      questionLower.includes('coverage')) {
    scores.testCases += 3;
  }
  
  if (questionLower.includes('change') || 
      questionLower.includes('update') || 
      questionLower.includes('history') ||
      questionLower.includes('why')) {
    scores.commitHistory += 3;
  }
  
  // Ensure all sources have at least a baseline score
  Object.keys(scores).forEach(key => {
    if (scores[key] === 0) scores[key] = 0.5;
  });
  
  return scores;
}

module.exports = {
  enhanceWithIntegratedKnowledge
};
```

### Integration with askGPT
```javascript
// In the askGPT endpoint, modify the enhanceWithRepositoryContent function:

async function enhanceWithRepositoryContent(question, log =
