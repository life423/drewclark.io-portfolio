/**
 * File Filter Service
 * 
 * Handles filtering of files for code processing to focus on relevant files
 * and exclude unnecessary ones.
 */

const path = require('path');

// File extensions to include
const INCLUDE_EXTENSIONS = [
  // JavaScript/TypeScript
  '.js', '.jsx', '.ts', '.tsx',
  // Web files
  '.html', '.css', '.scss', '.less',
  // Configuration
  '.json', '.yml', '.yaml',
  // Documentation
  '.md'
];

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  /\.min\.js$/,              // Minified JavaScript
  /\.bundle\.js$/,           // Bundled JavaScript
  /\.test\.js$/,             // Test files
  /\.spec\.js$/,             // Test specs
  /\.d\.ts$/,                // TypeScript declaration files
  /node_modules/,            // Dependencies
  /\.git/,                   // Git directory
  /build\//,                 // Build output
  /dist\//,                  // Distribution output
  /public\/assets/,          // Static assets
  /^\.\w+/                   // Hidden files/directories
];

// Higher priority directories - these will be processed first
const PRIORITY_DIRECTORIES = [
  'src',
  'app/src',
  'api',
  'components',
  'services',
  'hooks',
  'utils',
  'contexts'
];

/**
 * Check if a file should be included for processing
 * @param {string} filePath - Path to the file
 * @returns {boolean} Whether to include the file
 */
function shouldIncludeFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const ext = path.extname(normalizedPath).toLowerCase();
  
  // Check if extension is in include list
  if (!INCLUDE_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Check against exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate priority score for a file
 * @param {string} filePath - Path to the file
 * @returns {number} Priority score (higher = more important)
 */
function getFilePriority(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Start with base priority
  let priority = 1;
  
  // Check if it's in a priority directory
  for (const dir of PRIORITY_DIRECTORIES) {
    if (normalizedPath.includes(`/${dir}/`)) {
      priority += 2;
      break;
    }
  }
  
  // Core files are more important than tests
  if (normalizedPath.includes('/test') || normalizedPath.includes('.test.')) {
    priority -= 1;
  }
  
  // Configuration files are less important
  if (path.extname(normalizedPath) === '.json' || path.extname(normalizedPath) === '.yml') {
    priority -= 0.5;
  }
  
  // Files at repository root are often important
  const depth = normalizedPath.split('/').length;
  if (depth <= 2) {
    priority += 1;
  }
  
  return priority;
}

/**
 * Sort files by priority
 * @param {string[]} filePaths - Array of file paths
 * @returns {string[]} Sorted file paths
 */
function sortFilesByPriority(filePaths) {
  return [...filePaths].sort((a, b) => {
    const priorityA = getFilePriority(a);
    const priorityB = getFilePriority(b);
    return priorityB - priorityA; // Higher priority first
  });
}

module.exports = {
  shouldIncludeFile,
  getFilePriority,
  sortFilesByPriority,
  INCLUDE_EXTENSIONS,
  EXCLUDE_PATTERNS,
  PRIORITY_DIRECTORIES
};
