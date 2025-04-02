/**
 * Single Test Runner
 * 
 * This file allows running individual tests without the ES module complexities.
 */

const jest = require('jest');

// Get the test file from command line arguments
const testFile = process.argv[2];

if (!testFile) {
  console.error('Please specify a test file to run.');
  console.error('Example: node run-single-test.cjs src/__tests__/utils/rateLimit.test.js');
  process.exit(1);
}

console.log(`Running test file: ${testFile}`);

// Configure Jest options
const jestConfig = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [testFile],
};

// Run Jest with the configured options
jest.run(['--config', JSON.stringify(jestConfig)]);
