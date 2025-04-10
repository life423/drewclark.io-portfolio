#!/usr/bin/env node
/**
 * Start Frontend Development Server
 * 
 * This script:
 * 1. Kills any process on the frontend port
 * 2. Starts the Vite dev server in the app directory
 * 3. Sets up proper error handling and logging
 */

const { 
  log, 
  colors, 
  killProcessesOnPorts, 
  safeSpawn,
  rootDir
} = require('./utils');
const path = require('path');

// Configuration
const config = {
  frontendPort: 5173,
  appDir: path.join(rootDir, 'app'),
  logPrefix: '[Frontend]'
};

/**
 * Start the frontend server with npm
 */
async function startFrontendWithNpm() {
  log('Starting frontend server with npm...', 'frontend');
  
  try {
    const childProcess = safeSpawn('npm', ['run', 'dev'], {
      cwd: config.appDir
    });
    
    return setupFrontendProcessHandlers(childProcess);
  } catch (error) {
    log(`Failed to start frontend server with npm: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Start the frontend server with Vite directly
 */
async function startFrontendWithVite() {
  log('Starting frontend server with Vite directly...', 'frontend');
  
  try {
    // Find vite binary
    const isWindows = process.platform === 'win32';
    const nodeModulesPath = path.join(config.appDir, 'node_modules');
    const binExtension = isWindows ? '.cmd' : '';
    
    const vitePath = path.join(nodeModulesPath, '.bin', `vite${binExtension}`);
    
    const childProcess = safeSpawn(vitePath, [], {
      cwd: config.appDir
    });
    
    return setupFrontendProcessHandlers(childProcess);
  } catch (error) {
    log(`Failed to start frontend server with Vite: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Start the frontend server with npx
 */
async function startFrontendWithNpx() {
  log('Starting frontend server with npx...', 'frontend');
  
  try {
    const childProcess = safeSpawn('npx', ['vite'], {
      cwd: config.appDir
    });
    
    return setupFrontendProcessHandlers(childProcess);
  } catch (error) {
    log(`Failed to start frontend server with npx: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Set up event handlers for the frontend process
 */
function setupFrontendProcessHandlers(childProcess) {
  if (!childProcess) return null;
  
  // Handle stdout
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`${colors.frontend}${config.logPrefix}${colors.reset} ${line}`);
    });
  });
  
  // Handle stderr
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`${colors.frontend}${config.logPrefix}${colors.error} ${line}${colors.reset}`);
    });
  });
  
  // Handle process exit
  childProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`Frontend server process exited with code ${code}`, 'error');
    }
  });
  
  return childProcess;
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.bright}Starting Frontend Server${colors.reset}\n`);
  
  try {
    // Kill any process on the frontend port
    await killProcessesOnPorts([config.frontendPort]);
    
    // Try different methods to start the frontend server
    // Method 1: Using npm
    let frontendProcess = await startFrontendWithNpm();
    
    // Method 2: Using vite directly
    if (!frontendProcess) {
      log('Trying alternative method (vite)...', 'frontend');
      frontendProcess = await startFrontendWithVite();
    }
    
    // Method 3: Using npx
    if (!frontendProcess) {
      log('Trying fallback method (npx)...', 'frontend');
      frontendProcess = await startFrontendWithNpx();
    }
    
    // Check if we have a process
    if (!frontendProcess) {
      log('Failed to start frontend server. Please run it manually with "cd app && npm run dev".', 'error');
      return { success: false, reason: 'start-failed' };
    }
    
    log('Frontend server started successfully', 'success');
    
    // Keep the script running
    process.on('SIGINT', () => {
      log('Shutting down frontend server...', 'frontend');
      if (frontendProcess && !frontendProcess.killed) {
        frontendProcess.kill();
      }
      process.exit(0);
    });
    
    return { success: true, process: frontendProcess };
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
      log(`Frontend server startup failed: ${result.reason}`, 'error');
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
