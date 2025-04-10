/**
 * Shared utilities for development scripts
 */
const { exec, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Console color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  api: '\x1b[36m', // Cyan for API
  frontend: '\x1b[35m', // Magenta for frontend
  docker: '\x1b[34m', // Blue for Docker
  error: '\x1b[31m', // Red for errors
  success: '\x1b[32m', // Green for success
  warning: '\x1b[33m', // Yellow for warnings
  info: '\x1b[37m' // White for info
};

// Common constants
const isWindows = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');

/**
 * Log a message with timestamp and color
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const color = colors[type] || colors.info;
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

/**
 * Execute a command and return its output as a promise
 * @param {string} command - The command to execute
 * @param {Object} options - Options for exec
 * @returns {Promise<string>} - The command output
 */
function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { shell: true, ...options }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Check if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - Whether the port is in use
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.once('error', () => {
      resolve(true); // Port is in use
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port);
  });
}

/**
 * Kill processes running on specified ports
 * @param {number[]} ports - Array of ports to free up
 * @param {boolean} verbose - Whether to log detailed messages
 */
async function killProcessesOnPorts(ports, verbose = true) {
  try {
    if (verbose) {
      log(`Killing processes on ports: ${ports.join(', ')}`, 'info');
    }

    const promises = ports.map(async (port) => {
      try {
        if (isWindows) {
          // Windows approach using cross-platform module
          await execPromise(`npx cross-env kill-port ${port}`, { stdio: 'pipe' });
          if (verbose) log(`Killed process on port ${port}`, 'success');
        } else {
          // Unix approach
          const pid = await execPromise(`lsof -t -i:${port}`, { stdio: 'pipe' });
          if (pid) {
            await execPromise(`kill -9 ${pid}`, { stdio: 'pipe' });
            if (verbose) log(`Killed process on port ${port} (PID: ${pid})`, 'success');
          }
        }
      } catch (err) {
        if (verbose) log(`No process found on port ${port}`, 'info');
      }
    });

    await Promise.all(promises);

    // Make sure ports are actually free
    for (const port of ports) {
      let retries = 5;
      while (await isPortInUse(port) && retries > 0) {
        if (verbose) log(`Waiting for port ${port} to be released...`, 'warning');
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
      
      if (await isPortInUse(port)) {
        log(`Could not free up port ${port}. You may need to manually kill the process.`, 'error');
      }
    }
    
    return true;
  } catch (error) {
    log(`Error killing processes: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Safely spawn a process with cross-platform support
 * @param {string} command - The command to run
 * @param {string[]} args - Command arguments
 * @param {Object} options - Spawn options
 * @returns {ChildProcess} - The spawned process
 */
function safeSpawn(command, args, options = {}) {
  // Adjust command for Windows
  if (isWindows) {
    if (command === 'npm') {
      command = 'npm.cmd';
    } else if (command === 'npx') {
      command = 'npx.cmd';
    }
  }

  // Default to using shell on Windows
  const defaults = {
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: true },
    shell: isWindows
  };

  log(`Executing: ${command} ${args.join(' ')}`, 'info');
  
  return spawn(command, args, { ...defaults, ...options });
}

/**
 * Make an HTTP request with timeout
 * @param {string} url - The URL to request
 * @param {Object} options - HTTP options
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} - Response data
 */
function httpRequest(url, options = {}, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      timeout: timeoutMs,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data.length > 0 ? JSON.parse(data) : null
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          }
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    });
    
    req.end();
  });
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Options for retrying
 * @returns {Promise<any>} - Result of the function
 */
async function withRetry(fn, options = {}) {
  const { 
    retries = 3, 
    initialDelay = 1000, 
    maxDelay = 10000,
    factor = 2,
    onRetry = null 
  } = options;
  
  let attempt = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      if (attempt >= retries) {
        throw error;
      }
      
      // Log the retry
      if (onRetry) {
        onRetry(error, attempt, retries);
      } else {
        log(`Retry ${attempt}/${retries} after error: ${error.message}`, 'warning');
      }
      
      // Calculate delay with exponential backoff
      const nextDelay = Math.min(delay * factor, maxDelay);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = nextDelay;
    }
  }
}

// Export utilities
module.exports = {
  colors,
  isWindows,
  rootDir,
  log,
  execPromise,
  isPortInUse,
  killProcessesOnPorts,
  safeSpawn,
  httpRequest,
  withRetry
};
