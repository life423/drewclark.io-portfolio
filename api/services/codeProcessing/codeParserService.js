/**
 * Code Parser Service
 * 
 * Handles parsing code files into semantic chunks (functions, classes, methods)
 * for better code understanding and embedding.
 */
const fs = require('fs').promises;
const path = require('path');
const { shouldIncludeFile, getFilePriority } = require('./fileFilterService');

/**
 * Parse a file into semantic code units
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} Array of code units
 */
async function parseFileIntoUnits(filePath) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Skip binary or very large files
    if (isBinaryFile(content) || content.length > 1000000) {
      console.log(`Skipping file ${filePath}: binary or too large`);
      return [];
    }
    
    // Determine language based on extension
    const extension = path.extname(filePath).toLowerCase();
    
    // Parse file based on language
    let units = [];
    
    switch (extension) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
        units = parseJavaScriptFile(content, filePath);
        break;
      case '.md':
      case '.mdx':
        units = parseMarkdownFile(content, filePath);
        break;
      case '.html':
      case '.htm':
        units = parseHtmlFile(content, filePath);
        break;
      case '.css':
      case '.scss':
      case '.less':
        units = parseCssFile(content, filePath);
        break;
      case '.json':
      case '.yaml':
      case '.yml':
        units = parseConfigFile(content, filePath);
        break;
      default:
        units = parseGenericFile(content, filePath);
    }
    
    // Calculate importance for sorting
    const basePriority = getFilePriority(filePath);
    units.forEach(unit => {
      unit.importance = calculateUnitImportance(unit, extension, basePriority);
    });
    
    return units;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
}

/**
 * Parse JavaScript/TypeScript/JSX file into semantic units
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {Array} Semantic units
 */
function parseJavaScriptFile(content, filePath) {
  const filename = path.basename(filePath);
  const units = [];
  
  // Simple regex-based function extraction
  // Function declarations
  extractFunctions(content, /function\s+(\w+)\s*\([^)]*\)\s*{([^{}]*({[^{}]*}[^{}]*)*)?}/g, 'function', units, filePath);
  
  // Arrow functions with explicit names (const x = () => {})
  extractFunctions(content, /const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)=>\s*{([^{}]*({[^{}]*}[^{}]*)*)?}/g, 'arrow_function', units, filePath);
  
  // Classes
  extractFunctions(content, /class\s+(\w+)(?:\s+extends\s+[^\s{]+)?\s*{([^{}]*({[^{}]*}[^{}]*)*)?}/g, 'class', units, filePath);
  
  // React functional components (capitalized functions that return JSX)
  extractFunctions(content, /function\s+([A-Z]\w+)\s*\([^)]*\)\s*{([^{}]*({[^{}]*}[^{}]*)*)?}/g, 'component', units, filePath);
  extractFunctions(content, /const\s+([A-Z]\w+)\s*=\s*(?:\([^)]*\)|[^=]+)=>\s*{([^{}]*({[^{}]*}[^{}]*)*)?}/g, 'component', units, filePath);
  
  // Object methods
  extractFunctions(content, /(\w+)\s*:\s*function\s*\([^)]*\)\s*{([^{}]*({[^{}]*}[^{}]*)*)?}/g, 'method', units, filePath);
  
  // Always include the whole file as a unit
  units.push({
    type: 'file',
    name: filename,
    content: content,
    path: filePath,
    startLine: 1,
    endLine: content.split('\n').length
  });
  
  return units;
}

/**
 * Helper function to extract functions using regex
 */
function extractFunctions(content, pattern, type, units, filePath) {
  const lines = content.split('\n');
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const functionName = match[1];
    const functionContent = match[0];
    
    // Find the line numbers for this function
    const startIndex = content.substring(0, match.index).split('\n').length;
    const endIndex = startIndex + functionContent.split('\n').length - 1;
    
    units.push({
      type,
      name: functionName,
      content: functionContent,
      path: filePath,
      startLine: startIndex,
      endLine: endIndex
    });
  }
}

/**
 * Parse Markdown file into semantic units
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {Array} Semantic units
 */
function parseMarkdownFile(content, filePath) {
  const filename = path.basename(filePath);
  const units = [];
  
  // Split by headers
  const headerPattern = /^(#{1,3})\s+(.+)$/gm;
  let lastIndex = 0;
  let lastHeader = null;
  let match;
  
  while ((match = headerPattern.exec(content)) !== null) {
    if (lastHeader) {
      const sectionContent = content.substring(lastIndex, match.index);
      
      units.push({
        type: 'section',
        name: lastHeader.title,
        content: sectionContent,
        path: filePath,
        level: lastHeader.level,
        startLine: content.substring(0, lastIndex).split('\n').length,
        endLine: content.substring(0, match.index).split('\n').length
      });
    }
    
    lastHeader = {
      level: match[1].length,
      title: match[2]
    };
    lastIndex = match.index;
  }
  
  // Add the last section
  if (lastHeader) {
    const sectionContent = content.substring(lastIndex);
    
    units.push({
      type: 'section',
      name: lastHeader.title,
      content: sectionContent,
      path: filePath,
      level: lastHeader.level,
      startLine: content.substring(0, lastIndex).split('\n').length,
      endLine: content.split('\n').length
    });
  }
  
  // Always include the whole file
  units.push({
    type: 'file',
    name: filename,
    content: content,
    path: filePath,
    startLine: 1,
    endLine: content.split('\n').length
  });
  
  return units;
}

/**
 * Parse HTML file into semantic units
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {Array} Semantic units
 */
function parseHtmlFile(content, filePath) {
  const filename = path.basename(filePath);
  
  // For now, just treat the whole file as one unit
  // This could be enhanced to extract elements, scripts, styles, etc.
  return [{
    type: 'file',
    name: filename,
    content: content,
    path: filePath,
    startLine: 1,
    endLine: content.split('\n').length
  }];
}

/**
 * Parse CSS file into semantic units
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {Array} Semantic units
 */
function parseCssFile(content, filePath) {
  const filename = path.basename(filePath);
  const units = [];
  
  // Extract CSS rules
  const rulePattern = /([.#]?[\w-]+(?:\s*[.#][\w-]+)*)\s*{([^{}]*)}/g;
  let match;
  
  while ((match = rulePattern.exec(content)) !== null) {
    const selector = match[1].trim();
    const ruleContent = match[0];
    
    const startIndex = content.substring(0, match.index).split('\n').length;
    const endIndex = startIndex + ruleContent.split('\n').length - 1;
    
    units.push({
      type: 'css_rule',
      name: selector,
      content: ruleContent,
      path: filePath,
      startLine: startIndex,
      endLine: endIndex
    });
  }
  
  // Always include the whole file
  units.push({
    type: 'file',
    name: filename,
    content: content,
    path: filePath,
    startLine: 1,
    endLine: content.split('\n').length
  });
  
  return units;
}

/**
 * Parse configuration file (JSON, YAML) into semantic units
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {Array} Semantic units
 */
function parseConfigFile(content, filePath) {
  const filename = path.basename(filePath);
  
  // For now, just treat the whole file as one unit
  return [{
    type: 'file',
    name: filename,
    content: content,
    path: filePath,
    startLine: 1,
    endLine: content.split('\n').length
  }];
}

/**
 * Parse any other file type into semantic units
 * @param {string} content - File content
 * @param {string} filePath - Path to the file
 * @returns {Array} Semantic units
 */
function parseGenericFile(content, filePath) {
  const filename = path.basename(filePath);
  
  return [{
    type: 'file',
    name: filename,
    content: content,
    path: filePath,
    startLine: 1,
    endLine: content.split('\n').length
  }];
}

/**
 * Calculate importance score for a code unit
 * @param {Object} unit - Code unit
 * @param {string} extension - File extension
 * @param {number} basePriority - Base priority from file assessment
 * @returns {number} Importance score
 */
function calculateUnitImportance(unit, extension, basePriority = 1) {
  let score = basePriority;
  
  // Type-based scoring
  switch (unit.type) {
    case 'component':
      score += 3; // React components are very important
      break;
    case 'class':
      score += 2.5; // Classes define structure
      break;
    case 'function':
    case 'arrow_function':
      score += 2; // Functions are important
      break;
    case 'method':
      score += 1.5; // Methods are important
      break;
    case 'section':
      score += 1; // Documentation sections
      break;
    case 'file':
      score += 0.5; // Whole files are less specifically relevant
      break;
    default:
      score += 0;
  }
  
  // Content-based scoring
  if (unit.content) {
    // Exports are important
    if (unit.content.includes('export default') || unit.content.includes('module.exports')) {
      score += 1.5;
    } else if (unit.content.includes('export ')) {
      score += 1;
    }
    
    // Functions with JSX are likely components
    if ((unit.type === 'function' || unit.type === 'arrow_function') && 
        (unit.content.includes('return (') && unit.content.includes('<'))) {
      score += 1;
    }
    
    // Size consideration - medium-sized functions often most important
    const lineCount = (unit.content.match(/\n/g) || []).length + 1;
    if (lineCount >= 5 && lineCount <= 50) {
      score += 0.5; // Not too small, not too large
    } else if (lineCount > 100) {
      score -= 0.5; // Very large units might be less focused
    }
  }
  
  return score;
}

/**
 * Check if a file appears to be binary
 * @param {string} content - File content
 * @returns {boolean} Whether the file is binary
 */
function isBinaryFile(content) {
  // Simple heuristic: check for null bytes or high concentration of non-ASCII chars
  if (content.includes('\0')) {
    return true;
  }
  
  const nonAsciiChars = content.match(/[^\x00-\x7F]/g) || [];
  return nonAsciiChars.length > content.length * 0.3; // If >30% non-ASCII, likely binary
}

/**
 * Parse all files in a repository
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<Array>} Array of all code units
 */
async function parseRepository(repoPath) {
  try {
    console.log(`Parsing repository at ${repoPath}`);
    
    // Get all files recursively
    const allFiles = await getAllFiles(repoPath);
    
    // Filter to only include relevant files
    const relevantFiles = allFiles.filter(file => shouldIncludeFile(file));
    
    console.log(`Found ${relevantFiles.length} relevant files out of ${allFiles.length} total files`);
    
    // Sort files by priority to process important ones first
    const sortedFiles = relevantFiles.sort((a, b) => {
      return getFilePriority(b) - getFilePriority(a);
    });
    
    // Parse each file
    const allUnits = [];
    
    for (const file of sortedFiles) {
      const units = await parseFileIntoUnits(file);
      allUnits.push(...units);
      
      // Log progress periodically
      if (allUnits.length % 100 === 0) {
        console.log(`Parsed ${allUnits.length} code units so far...`);
      }
    }
    
    console.log(`Completed parsing with ${allUnits.length} total code units`);
    
    return allUnits;
  } catch (error) {
    console.error(`Error parsing repository at ${repoPath}:`, error);
    return [];
  }
}

/**
 * Get all files in a directory recursively
 * @param {string} dirPath - Directory path
 * @param {Array} [arrayOfFiles=[]] - Accumulator array
 * @returns {Promise<Array>} Array of file paths
 */
async function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      // Skip hidden directories and files
      if (file.startsWith('.')) {
        continue;
      }
      
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, build directories
        if (['node_modules', 'dist', 'build'].includes(file)) {
          continue;
        }
        
        arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    }
    
    return arrayOfFiles;
  } catch (error) {
    console.error(`Error getting files from ${dirPath}:`, error);
    return arrayOfFiles;
  }
}

module.exports = {
  parseFileIntoUnits,
  parseRepository,
  calculateUnitImportance,
  getAllFiles
};
