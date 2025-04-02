/**
 * Rate Limit Tests Runner
 * 
 * This script runs the rate limiting tests we've created
 * to verify that our feature-specific rate limiting works correctly.
 */

// Import Jest using ES module syntax
import { run } from 'jest';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Jest options
const jestConfig = {
  projects: [__dirname],
  testMatch: [
    '**/__tests__/utils/rateLimit.test.js',
    '**/__tests__/integration/feature-interactions.test.js'
  ],
  verbose: true,
  testEnvironment: 'jsdom'
};

console.log('Running rate limiting tests...');
console.log('Testing:');
console.log('1. Feature-specific rate limits');
console.log('2. Feature interaction independence');
console.log('----------------------------------------');

// Run the tests
run(jestConfig)
  .then(success => {
    console.log('----------------------------------------');
    if (!success) {
      console.log('Tests failed!');
      process.exit(1);
    } else {
      console.log('All tests passed!');
      console.log('The rate limiting solution is working correctly.');
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
