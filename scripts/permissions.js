#!/usr/bin/env node
/**
 * File Permissions Manager
 * 
 * This script ensures executable permissions are properly set on key scripts.
 * It is cross-platform and works on both Unix-like systems and Windows.
 * It is called during the postinstall process to ensure proper functionality.
 */

const fs = require("fs");
const path = require("path");
const { log, colors } = require('./utils');
const { spawn } = require('child_process');

// Configuration: Files that need executable permissions
const files = [
  "./start-app.js", 
  "./dev-start.js",
  "./scripts/qdrant/index.js"
];

/**
 * Set permissions on Windows using PowerShell
 */
async function setWindowsPermissions(filePath) {
  return new Promise((resolve, reject) => {
    // Use PowerShell to set permissions
    const ps = spawn('powershell.exe', [
      '-Command',
      `& {Set-ItemProperty -Path '${filePath.replace(/\//g, '\\')}' -Name IsReadOnly -Value $false}`
    ]);
    
    ps.stderr.on('data', (data) => {
      reject(new Error(`PowerShell error: ${data.toString()}`));
    });
    
    ps.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`PowerShell exited with code ${code}`));
      }
    });
  });
}

/**
 * Set executable permissions on Unix-like systems
 */
function setUnixPermissions(filePath) {
  fs.chmodSync(filePath, "755");
  return true;
}

/**
 * Detect platform and set permissions accordingly
 */
async function setPermissionsForFile(filePath) {
  const isWindows = process.platform === 'win32';
  
  try {
    if (isWindows) {
      await setWindowsPermissions(filePath);
    } else {
      setUnixPermissions(filePath);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Main function to set permissions on all files
 */
async function setPermissions() {
  let succeeded = 0;
  let failed = 0;

  console.log(`\n${colors.bright}Setting Executable Permissions${colors.reset}\n`);
  
  // Convert file paths to absolute paths
  const rootDir = path.resolve(__dirname, '..');
  
  for (const file of files) {
    const filePath = path.resolve(rootDir, file);
    
    if (fs.existsSync(filePath)) {
      try {
        await setPermissionsForFile(filePath);
        log(`Permissions set: ${file}`, 'success');
        succeeded++;
      } catch (error) {
        log(`Could not set permissions for ${file}: ${error.message}`, 'error');
        failed++;
      }
    } else {
      log(`File not found: ${filePath}`, 'warning');
    }
  }

  if (succeeded > 0) {
    log(`Successfully set permissions for ${succeeded} file(s)`, 'success');
  }
  
  if (failed > 0) {
    log(`Failed to set permissions for ${failed} file(s)`, 'warning');
  }
}

// Run the script if called directly
if (require.main === module) {
  setPermissions().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setPermissions };
