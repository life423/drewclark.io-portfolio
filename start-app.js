#!/usr/bin/env node
/**
 * App Starter Script for Portfolio
 * 
 * This script helps manage the development environment by:
 * - Checking if necessary ports are available
 * - Automatically handling port conflicts
 * - Starting the application with proper error handling
 * 
 * Usage: 
 *   node start-app.js          - Interactive mode with prompts
 *   node start-app.js --auto   - Automatic mode that kills conflicting processes
 */

const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const autoMode = args.includes('--auto');

// Load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (err) {
  // dotenv is not required, fallback to default ports
}

// Configuration
const config = {
  backendPort: process.env.PORT || 3000,
  frontendPort: 5173,
  checkCommand: process.platform === 'win32' 
    ? 'netstat -ano | findstr /R ":%PORT%\\s"'
    : 'lsof -i :%PORT% -t',
  killCommand: process.platform === 'win32'
    ? 'taskkill /F /PID %PID%'
    : 'kill -9 %PID%',
  autoMode: autoMode
};

/**
 * Check if a port is in use
 * @param {number} port - Port to check
 * @returns {Promise<number|null>} Process ID using the port, or null if available
 */
async function checkPort(port) {
  try {
    const command = config.checkCommand.replace('%PORT%', port);
    const { stdout } = await execAsync(command);
    
    if (!stdout.trim()) {
      return null; // Port is available
    }
    
    // Extract PID from output based on platform
    if (process.platform === 'win32') {
      // Windows netstat output format
      const match = stdout.match(/[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+([0-9]+)/);
      return match ? parseInt(match[1], 10) : null;
    } else {
      // Unix lsof output format is just the PID
      return parseInt(stdout.trim(), 10);
    }
  } catch (error) {
    // Command failed, which often means no process found
    return null;
  }
}

/**
 * Kill a process by PID
 * @param {number} pid - Process ID to kill
 * @returns {Promise<boolean>} Success status
 */
async function killProcess(pid) {
  try {
    const command = config.killCommand.replace('%PID%', pid);
    await execAsync(command);
    return true;
  } catch (error) {
    console.error(`Failed to kill process ${pid}:`, error.message);
    return false;
  }
}

/**
 * Prompt for user confirmation
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} User response
 */
function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${question} (y/n) `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Start development server with proper logging
 */
function startDevServer() {
  console.log('\nStarting development server...\n');
  
  // Start backend and frontend directly - avoid using concurrently command
  const backendProcess = spawn('nodemon', ['server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  console.log('Starting frontend...');
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: './app'
  });
  
  // Store processes for cleanup
  const processes = [backendProcess, frontendProcess];
  
  // Handle process errors
  backendProcess.on('error', (error) => {
    console.error('\nFailed to start backend server:', error.message);
    process.exit(1);
  });
  
  frontendProcess.on('error', (error) => {
    console.error('\nFailed to start frontend server:', error.message);
    process.exit(1);
  });
  
  // Handle CTRL+C gracefully
  process.on('SIGINT', () => {
    console.log('\nShutting down development server...');
    processes.forEach(process => {
      try {
        process.kill('SIGINT');
      } catch (err) {
        // Ignore errors during shutdown
      }
    });
    setTimeout(() => process.exit(0), 500);
  });
}

/**
 * Main function to start the application
 */
async function main() {
  console.log('Portfolio App Starter');
  console.log('===================');
  console.log(`Mode: ${config.autoMode ? 'Automatic' : 'Interactive'}`);
  
  // Check frontend port
  const frontendPid = await checkPort(config.frontendPort);
  if (frontendPid) {
    console.log(`Frontend port ${config.frontendPort} is in use by process ${frontendPid}.`);
    
    // In auto mode, kill automatically; otherwise, ask for confirmation
    const shouldKill = config.autoMode ? true : await confirm('Do you want to kill this process?');
    
    if (shouldKill) {
      console.log(`Attempting to kill process ${frontendPid}...`);
      const success = await killProcess(frontendPid);
      if (!success) {
        console.error(`Failed to free port ${config.frontendPort}. Please close the application manually.`);
        process.exit(1);
      }
      console.log(`Freed port ${config.frontendPort}.`);
    } else {
      console.log('Cannot start without freeing the port. Exiting.');
      process.exit(1);
    }
  }
  
  // Check backend port
  const backendPid = await checkPort(config.backendPort);
  if (backendPid) {
    console.log(`Backend port ${config.backendPort} is in use by process ${backendPid}.`);
    
    // In auto mode, kill automatically; otherwise, ask for confirmation
    const shouldKill = config.autoMode ? true : await confirm('Do you want to kill this process?');
    
    if (shouldKill) {
      console.log(`Attempting to kill process ${backendPid}...`);
      const success = await killProcess(backendPid);
      if (!success) {
        console.error(`Failed to free port ${config.backendPort}. Please close the application manually.`);
        process.exit(1);
      }
      console.log(`Freed port ${config.backendPort}.`);
    } else {
      console.log('Cannot start without freeing the port. Exiting.');
      process.exit(1);
    }
  }
  
  // Start the development server
  startDevServer();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error.message);
  process.exit(1);
});
