#!/usr/bin/env node
/**
 * Main Development Environment Script
 * 
 * This script orchestrates the entire development environment:
 * 1. Ensures Qdrant is running (if Docker is available)
 * 2. Starts the API server with automatic restart
 * 3. Starts the frontend dev server
 * 4. Handles graceful shutdown of all processes
 */

const { log, colors } = require('./utils');
const path = require('path');
const { spawn } = require('child_process');

// Import individual scripts
const qdrantScript = require('./ensure-qdrant');
const apiScript = require('./start-api-server');
const frontendScript = require('./start-frontend');

// Process command line arguments
const args = process.argv.slice(2);
const options = {
  skipDocker: args.includes('--skip-docker'),
  apiOnly: args.includes('--api-only'),
  frontendOnly: args.includes('--frontend-only'),
  help: args.includes('--help')
};

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bright}Drew Clark Portfolio Development Environment${colors.reset}

Usage: node scripts/dev.js [options]

Options:
  --api-only       Start only the API server
  --frontend-only  Start only the frontend server
  --skip-docker    Skip Docker container management
  --help           Show this help message

This script orchestrates the entire development environment by:
- Starting the Qdrant vector database for AI code context (if Docker is available)
- Running the API server with automatic reloading
- Starting the Vite frontend development server
- Providing unified logging and graceful shutdown

Each component can be run independently by using the specific flags.
`);
  process.exit(0);
}

/**
 * Main function
 */
async function main() {
  console.log(`
${colors.bright}=============================================
      Drew Clark Portfolio - Development Mode
=============================================
${colors.reset}
  `);
  
  if (options.help) {
    showHelp();
    return;
  }
  
  const activeProcesses = [];
  
  try {
    // Step 1: Check Qdrant (unless we're frontend-only)
    if (!options.frontendOnly && !options.skipDocker) {
      await qdrantScript.main();
    }
    
    // Step 2: Start API server (unless we're frontend-only)
    if (!options.frontendOnly) {
      const apiResult = await apiScript.main();
      if (apiResult.success && apiResult.process) {
        activeProcesses.push({
          name: 'API Server',
          process: apiResult.process
        });
      }
    }
    
    // Step 3: Start frontend server (unless we're api-only)
    if (!options.apiOnly) {
      const frontendResult = await frontendScript.main();
      if (frontendResult.success && frontendResult.process) {
        activeProcesses.push({
          name: 'Frontend Server',
          process: frontendResult.process
        });
      }
    }
    
    // Step 4: Set up graceful shutdown
    process.on('SIGINT', () => {
      log('Shutting down all processes...', 'info');
      
      // Kill all active processes
      activeProcesses.forEach(({ name, process }) => {
        log(`Stopping ${name}...`, 'info');
        if (process && !process.killed) {
          process.kill();
        }
      });
      
      log('All processes stopped, exiting', 'success');
      process.exit(0);
    });
    
    // If we made it here, everything is running
    if (activeProcesses.length > 0) {
      log(`Development environment running with ${activeProcesses.length} active processes`, 'success');
      log('Press Ctrl+C to stop all services', 'info');
    } else {
      log('No processes were started successfully. Please check the logs.', 'error');
      process.exit(1);
    }
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error);
    
    // Kill any processes that might have started
    activeProcesses.forEach(({ process }) => {
      if (process && !process.killed) {
        process.kill();
      }
    });
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`Unhandled error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });
}
