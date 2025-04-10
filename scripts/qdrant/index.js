#!/usr/bin/env node
/**
 * Qdrant Vector Database CLI
 * 
 * A unified command-line interface for managing Qdrant operations:
 * - Starting/stopping the Qdrant container
 * - Seeding vector collections
 * - Fixing ID format issues
 * - Checking service status
 * 
 * Usage: node scripts/qdrant/index.js [command]
 */

const { log, colors } = require('../utils');
const ensure = require('./ensure');
const fixIds = require('./fix-ids');
const seed = require('./seed');

/**
 * Show CLI help information
 */
function showHelp() {
  console.log(`
${colors.bright}Qdrant Vector Database CLI${colors.reset}

Usage:
  node scripts/qdrant/index.js [command]

Commands:
  --start        Start Qdrant container and ensure collections exist
  --stop         Stop and remove Qdrant container
  --restart      Restart Qdrant container (stop + start)
  --status       Show Qdrant service status
  --seed         Seed vector collections with existing embeddings
  --fix-ids      Fix vector ID format issues in qdrantService.js
  --help         Show this help message

Examples:
  npm run qdrant:start            Start Qdrant vector database
  npm run qdrant:seed             Seed collections with embeddings
  npm run qdrant:status           Check if Qdrant is running properly
  node scripts/qdrant/index.js --fix-ids    Fix ID format issues
  `);
}

/**
 * Display Qdrant status
 */
async function showStatus() {
  console.log(`\n${colors.bright}Qdrant Status${colors.reset}\n`);
  
  try {
    const status = await ensure.getQdrantStatus();
    
    if (status.running) {
      if (status.healthy) {
        log(`Qdrant is running and healthy`, 'success');
        log(`URL: ${status.url}`, 'info');
        log(`Port: ${status.port}`, 'info');
      } else {
        log(`Qdrant container is running but not healthy`, 'warning');
        log(`Reason: ${status.reason}`, 'error');
      }
    } else {
      log(`Qdrant is not running`, 'warning');
      log(`Reason: ${status.reason}`, 'info');
    }
  } catch (error) {
    log(`Error checking status: ${error.message}`, 'error');
  }
}

/**
 * Restart Qdrant container
 */
async function restartQdrant() {
  console.log(`\n${colors.bright}Restarting Qdrant${colors.reset}\n`);
  
  try {
    // Stop container
    log('Stopping Qdrant container...', 'info');
    await ensure.stopQdrantContainer();
    
    // Start container again
    log('Starting Qdrant container...', 'info');
    const result = await ensure.ensureQdrant();
    
    if (result.success) {
      log('Qdrant restarted successfully', 'success');
    } else {
      log(`Failed to restart Qdrant: ${result.reason}`, 'error');
    }
  } catch (error) {
    log(`Error restarting Qdrant: ${error.message}`, 'error');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--help';
  
  try {
    switch (command) {
      case '--start':
        await ensure.ensureQdrant();
        break;
        
      case '--stop':
        await ensure.stopQdrantContainer();
        break;
        
      case '--restart':
        await restartQdrant();
        break;
        
      case '--status':
        await showStatus();
        break;
        
      case '--seed':
        await seed.seedQdrant();
        break;
        
      case '--fix-ids':
        await fixIds.fixQdrantIds();
        break;
        
      case '--help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`Error executing command: ${error.message}`, 'error');
    console.error(error);
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

module.exports = {
  ensureQdrant: ensure.ensureQdrant,
  fixQdrantIds: fixIds.fixQdrantIds,
  seedQdrant: seed.seedQdrant,
  getQdrantStatus: ensure.getQdrantStatus,
  stopQdrantContainer: ensure.stopQdrantContainer,
  restartQdrant
};
