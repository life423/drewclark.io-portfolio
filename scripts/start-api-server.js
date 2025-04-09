#!/usr/bin/env node
/**
 * Start API Server
 * 
 * This script:
 * 1. Kills any process on the API port
 * 2. Starts the backend API server with auto-reloading
 * 3. Sets up proper error handling and logging
 */

const { 
  log, 
  colors, 
  killProcessesOnPorts, 
  safeSpawn,
  rootDir,
  withRetry
} = require('./utils');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  apiPort: 3000,
  serverScript: path.join(rootDir, 'server.js'),
  logPrefix: '[API]'
};

/**
 * Start the API server using direct nodemon path
 */
async function startApiServerWithDirectPath() {
  log('Starting API server using direct nodemon path...', 'api');
  
  try {
    // Find nodemon binary
    const isWindows = process.platform === 'win32';
    const nodeModulesPath = path.join(rootDir, 'node_modules');
    const binExtension = isWindows ? '.cmd' : '';
    
    const nodemonPaths = [
      path.join(nodeModulesPath, '.bin', `nodemon${binExtension}`),
      path.join(nodeModulesPath, 'nodemon', 'bin', 'nodemon.js')
    ];
    
    let nodemonPath = null;
    for (const possiblePath of nodemonPaths) {
      if (fs.existsSync(possiblePath)) {
        nodemonPath = possiblePath;
        break;
      }
    }
    
    if (!nodemonPath) {
      throw new Error('Could not find nodemon executable');
    }
    
    log(`Using nodemon at: ${nodemonPath}`, 'api');
    
    // Determine how to launch nodemon
    let childProcess;
    if (nodemonPath.endsWith('.js')) {
      // For .js files, use node to execute
      childProcess = safeSpawn('node', [nodemonPath, config.serverScript]);
    } else {
      // For binaries, execute directly
      childProcess = safeSpawn(nodemonPath, [config.serverScript]);
    }
    
    return setupApiProcessHandlers(childProcess);
  } catch (error) {
    log(`Failed to start API server using direct path: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Start the API server using npm run
 */
async function startApiServerWithNpm() {
  log('Starting API server using npm run...', 'api');
  
  try {
    const childProcess = safeSpawn('npm', ['run', 'nodemon', '--', 'server.js']);
    return setupApiProcessHandlers(childProcess);
  } catch (error) {
    log(`Failed to start API server using npm: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Start the API server using node directly
 */
async function startApiServerWithNode() {
  log('Starting API server directly with Node.js (no auto-reload)...', 'api');
  
  try {
    const childProcess = safeSpawn('node', [config.serverScript]);
    return setupApiProcessHandlers(childProcess);
  } catch (error) {
    log(`Failed to start API server directly: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Set up event handlers for the API process
 */
function setupApiProcessHandlers(childProcess) {
  if (!childProcess) return null;
  
  // Handle stdout
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`${colors.api}${config.logPrefix}${colors.reset} ${line}`);
    });
  });
  
  // Handle stderr
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`${colors.api}${config.logPrefix}${colors.error} ${line}${colors.reset}`);
    });
  });
  
  // Handle process exit
  childProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`API server process exited with code ${code}`, 'error');
    }
  });
  
  return childProcess;
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.bright}Starting API Server${colors.reset}\n`);
  
  try {
    // Kill any process on the API port
    await killProcessesOnPorts([config.apiPort]);
    
    // Try different methods to start the API server
    // Method 1: Direct nodemon path
    let apiProcess = await startApiServerWithDirectPath();
    
    // Method 2: Using npm run
    if (!apiProcess) {
      log('Trying alternative method (npm)...', 'api');
      apiProcess = await startApiServerWithNpm();
    }
    
    // Method 3: Using node directly (fallback)
    if (!apiProcess) {
      log('Trying fallback method (node)...', 'api');
      apiProcess = await startApiServerWithNode();
    }
    
    // Check if we have a process
    if (!apiProcess) {
      log('Failed to start API server. Please run it manually.', 'error');
      return { success: false, reason: 'start-failed' };
    }
    
    log('API server started successfully', 'success');
    
    // Keep the script running
    process.on('SIGINT', () => {
      log('Shutting down API server...', 'api');
      if (apiProcess && !apiProcess.killed) {
        apiProcess.kill();
      }
      process.exit(0);
    });
    
    return { success: true, process: apiProcess };
  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'error');
    console.error(error);
    return { success: false, reason: 'unexpected-error', error: error.message };
  }
}

// Run the script if called directly
if (require.main === module) {
  main().then(result => {
    if (!result.success) {
      log(`API server startup failed: ${result.reason}`, 'error');
      process.exit(1);
    }
    // Keep running
  }).catch(err => {
    log(`Fatal error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
