/**
 * Code Parser for Embedding POC
 * 
 * A simplified parser that finds JavaScript files in a repository
 * and extracts functions and classes with basic regex.
 */

const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));

/**
 * Finds all code files in a repository
 * @param {string} repoPath - Path to repository
 * @returns {Promise<string[]>} Array of file paths
 */
async function findCodeFiles(repoPath) {
  // For the POC, we'll focus on JavaScript and related files
  const patterns = [
    '**/*.js', 
    '**/*.jsx', 
    '**/*.ts', 
    '**/*.tsx'
  ];
  
  // Directories to ignore
  const ignore = [
    '**/node_modules/**', 
    '**/dist/**', 
    '**/build/**', 
    '**/.git/**'
  ];
  
  let allFiles = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, { 
      cwd: repoPath, 
      ignore,
      absolute: true
    });
    allFiles = [...allFiles, ...files];
  }
  
  return allFiles;
}

/**
 * Identifies programming language based on file extension
 * @param {string} filePath - Path to the file
 * @returns {string} Language name
 */
function identifyLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const languages = {
    '.js': 'JavaScript',
    '.jsx': 'React JSX',
    '.ts': 'TypeScript',
    '.tsx': 'React TSX'
  };
  
  return languages[ext] || 'Unknown';
}

/**
 * Extracts code segments from a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} Array of code segments
 */
async function extractCodeSegments(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const language = identifyLanguage(filePath);
    const segments = [];
    
    // Add the whole file as a segment for context
    segments.push({
      type: 'file',
      name: path.basename(filePath),
      path: filePath,
      language,
      content: content.length > 10000 ? content.substring(0, 10000) + '...(truncated)' : content,
      startLine: 1,
      endLine: content.split('\n').length
    });
    
    // Extract individual functions, classes, etc.
    const parsedSegments = parseCodeIntoFunctions(content, path.extname(filePath));
    
    for (const segment of parsedSegments) {
      segments.push({
        ...segment,
        path: filePath,
        language
      });
    }
    
    return segments;
  } catch (error) {
    console.error(`Error extracting code from ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Parses code file into logical segments (functions, classes, etc.)
 * @param {string} code - Source code content
 * @param {string} extension - File extension
 * @returns {Array<{type: string, name: string, content: string, startLine: number, endLine: number}>}
 */
function parseCodeIntoFunctions(code, extension) {
  const lines = code.split('\n');
  const segments = [];
  
  // Basic regex patterns for common code constructs
  const patterns = {
    '.js': [
      { type: 'function', regex: /function\s+([a-zA-Z0-9_$]+)\s*\(/ },
      { type: 'arrow_function', regex: /const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/ },
      { type: 'class', regex: /class\s+([a-zA-Z0-9_$]+)/ },
      { type: 'method', regex: /([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*{/ }
    ],
    '.jsx': [
      { type: 'function', regex: /function\s+([a-zA-Z0-9_$]+)\s*\(/ },
      { type: 'arrow_function', regex: /const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/ },
      { type: 'component', regex: /(?:function|const)\s+([A-Z][a-zA-Z0-9_$]*)\s*\(?/ },
      { type: 'class', regex: /class\s+([a-zA-Z0-9_$]+)/ },
      { type: 'method', regex: /([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*{/ }
    ],
    '.ts': [
      { type: 'function', regex: /function\s+([a-zA-Z0-9_$]+)\s*\(/ },
      { type: 'arrow_function', regex: /const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/ },
      { type: 'interface', regex: /interface\s+([a-zA-Z0-9_$]+)/ },
      { type: 'type', regex: /type\s+([a-zA-Z0-9_$]+)\s*=/ },
      { type: 'class', regex: /class\s+([a-zA-Z0-9_$]+)/ },
      { type: 'method', regex: /([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*{/ }
    ],
    '.tsx': [
      { type: 'function', regex: /function\s+([a-zA-Z0-9_$]+)\s*\(/ },
      { type: 'arrow_function', regex: /const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/ },
      { type: 'component', regex: /(?:function|const)\s+([A-Z][a-zA-Z0-9_$]*)\s*\(?/ },
      { type: 'interface', regex: /interface\s+([a-zA-Z0-9_$]+)/ },
      { type: 'type', regex: /type\s+([a-zA-Z0-9_$]+)\s*=/ },
      { type: 'class', regex: /class\s+([a-zA-Z0-9_$]+)/ },
      { type: 'method', regex: /([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*{/ }
    ]
  };
  
  // Get patterns based on file extension
  const filePatterns = patterns[extension] || patterns['.js'];  // Default to JS
  
  // Find segments in the code
  let currentSegment = null;
  let bracketCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If not in a segment, check if line starts one
    if (!currentSegment) {
      for (const pattern of filePatterns) {
        const match = line.match(pattern.regex);
        if (match) {
          currentSegment = {
            type: pattern.type,
            name: match[1],
            content: line,
            startLine: i + 1,
            endLine: null
          };
          // Track brackets for segment end detection
          bracketCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
          break;
        }
      }
    } else {
      // Add line to current segment
      currentSegment.content += '\n' + line;
      
      // Update bracket count
      bracketCount += (line.match(/{/g) || []).length;
      bracketCount -= (line.match(/}/g) || []).length;
      
      // If brackets balance, end the segment
      if (bracketCount === 0) {
        currentSegment.endLine = i + 1;
        segments.push(currentSegment);
        currentSegment = null;
      }
    }
  }
  
  // Add any segment that reached the end of file
  if (currentSegment) {
    currentSegment.endLine = lines.length;
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Processes an entire repository to extract code segments
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<Array>} Array of code segments from all files
 */
async function processRepository(repoPath) {
  try {
    const files = await findCodeFiles(repoPath);
    console.log(`Found ${files.length} code files to process`);
    
    let allSegments = [];
    let processedFiles = 0;
    
    for (const file of files) {
      const segments = await extractCodeSegments(file);
      allSegments = [...allSegments, ...segments];
      
      processedFiles++;
      if (processedFiles % 10 === 0) {
        console.log(`Processed ${processedFiles}/${files.length} files`);
      }
    }
    
    console.log(`Extracted ${allSegments.length} code segments from ${files.length} files`);
    return allSegments;
  } catch (error) {
    console.error('Error processing repository:', error.message);
    throw error;
  }
}

module.exports = {
  findCodeFiles,
  extractCodeSegments,
  processRepository,
  identifyLanguage
};
