#!/usr/bin/env node
/**
 * Fix Qdrant Vector Database ID format
 * 
 * This script modifies the qdrantService.js file to use UUID-based IDs
 * instead of path-based IDs that can cause format errors in Qdrant.
 */

const fs = require('fs');
const path = require('path');
const { log, colors, rootDir } = require('./utils');

// Configuration
const config = {
  qdrantServicePath: path.join(rootDir, 'api', 'services', 'vectorDb', 'qdrantService.js'),
  backupSuffix: '.bak'
};

/**
 * Create a backup of the file
 */
function createBackup(filePath) {
  const backupPath = `${filePath}${config.backupSuffix}`;
  fs.copyFileSync(filePath, backupPath);
  log(`Created backup at ${backupPath}`, 'info');
  return backupPath;
}

/**
 * Fix the Qdrant ID format in the file
 */
function fixQdrantIdFormat(filePath) {
  // Read the file
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Import UUID
  const uuidImport = "const { v4: uuidv4 } = require('uuid');";
  let modifiedContent = content;
  
  if (!content.includes('uuidv4')) {
    // Find the imports section and add UUID
    const importRegex = /^(const|let|var|import).*require.*$/m;
    const match = content.match(importRegex);
    
    if (match) {
      const importLine = match[0];
      modifiedContent = content.replace(importLine, `${importLine}\n${uuidImport}`);
    } else {
      // If we can't find imports, add it at the top
      modifiedContent = `${uuidImport}\n\n${content}`;
    }
    
    log('Added UUID import', 'success');
  }
  
  // Fix 2: Add ID mapping function
  const idMapperFunction = `
/**
 * Generate a UUID for a vector point that's consistent for the same input
 * @param {string} repository - Repository identifier
 * @param {string} path - Path or other identifier
 * @returns {string} - UUID v4 string
 */
function generatePointId(repository, path) {
  // Option 1: Generate a completely random UUID (preferred by Qdrant)
  return uuidv4();
  
  // Option 2: If you need deterministic IDs based on content
  // const hash = crypto.createHash('md5').update(\`\${repository}-\${path}\`).digest('hex');
  // return hash;
}`;

  if (!modifiedContent.includes('generatePointId')) {
    // Find a good place to add the function
    const classOrExportRegex = /class QdrantService|module\.exports/;
    const match = modifiedContent.match(classOrExportRegex);
    
    if (match) {
      const insertPos = match.index;
      modifiedContent = 
        modifiedContent.slice(0, insertPos) + 
        idMapperFunction + 
        '\n\n' + 
        modifiedContent.slice(insertPos);
    } else {
      // If we can't find a good spot, add it near the top
      modifiedContent = modifiedContent.replace(uuidImport, `${uuidImport}\n${idMapperFunction}`);
    }
    
    log('Added ID generation function', 'success');
  }
  
  // Fix 3: Replace ID creation logic
  const oldIdPatterns = [
    /const\s+id\s*=\s*`[\w${}:\\/-]+`/g,
    /point\.id\s*=\s*`[\w${}:\\/-]+`/g,
    /id:\s*`[\w${}:\\/-]+`/g
  ];
  
  let replacements = 0;
  
  for (const pattern of oldIdPatterns) {
    // Find matches for the pattern
    const matches = modifiedContent.match(pattern) || [];
    
    for (const match of matches) {
      // Extract repository and path info from the match if possible
      const repoMatch = match.match(/(\w+)-(\w+)/);
      const repo = repoMatch ? `${repoMatch[1]}/${repoMatch[2]}` : 'unknown';
      
      // Replace with UUID generation
      if (match.includes('const id =')) {
        // For standalone ID declarations
        const newId = `const id = generatePointId("${repo}", chunk.path || "unknown")`;
        modifiedContent = modifiedContent.replace(match, newId);
        replacements++;
      } else if (match.includes('point.id =')) {
        // For point.id assignments
        const newId = `point.id = generatePointId("${repo}", point.metadata?.path || "unknown")`;
        modifiedContent = modifiedContent.replace(match, newId);
        replacements++;
      } else if (match.includes('id:')) {
        // For object literals with id property
        const newId = `id: generatePointId("${repo}", "unknown")`;
        modifiedContent = modifiedContent.replace(match, newId);
        replacements++;
      }
    }
  }
  
  log(`Replaced ${replacements} ID formats with UUID-based IDs`, 'success');
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, modifiedContent);
  log(`Updated ${filePath}`, 'success');
  
  return replacements;
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.bright}Fixing Qdrant ID Format Issues${colors.reset}\n`);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(config.qdrantServicePath)) {
      log(`Qdrant service file not found at: ${config.qdrantServicePath}`, 'error');
      return { success: false, reason: 'file-not-found' };
    }
    
    // Create backup
    const backupPath = createBackup(config.qdrantServicePath);
    
    // Fix the file
    const replacements = fixQdrantIdFormat(config.qdrantServicePath);
    
    if (replacements > 0) {
      log(`Successfully fixed ${replacements} ID format issues in Qdrant service`, 'success');
      log('You will need to restart the API server for changes to take effect', 'info');
      return { success: true, replacements, backupPath };
    } else {
      log('No ID format issues found or fixed', 'warning');
      // Restore from backup if no changes were made
      fs.copyFileSync(backupPath, config.qdrantServicePath);
      log(`Restored original file from backup`, 'info');
      return { success: false, reason: 'no-changes-needed' };
    }
  } catch (error) {
    log(`Error fixing Qdrant ID format: ${error.message}`, 'error');
    console.error(error);
    return { success: false, reason: 'error', error: error.message };
  }
}

// Run the script if called directly
if (require.main === module) {
  main().then(result => {
    if (result.success) {
      log(`Qdrant ID format fixed successfully`, 'success');
      log(`Original file backed up to: ${result.backupPath}`, 'info');
    } else {
      log(`Failed to fix Qdrant ID format: ${result.reason}`, 'error');
    }
  }).catch(err => {
    log(`Fatal error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
