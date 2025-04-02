/**
 * Jest configuration for the Connect4 AI and Project Cards tests
 */

module.exports = {
  // Use node environment for our tests
  testEnvironment: 'node',
  
  // Files to transform with babel
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Handle CSS and other static assets
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // ES Module Support
  extensionsToTreatAsEsm: ['.js', '.jsx'],
  
  // Modify testMatch pattern to include our test files
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx'
  ],
  
  // Mock fetch
  setupFiles: [
    'jest-fetch-mock/setupJest'
  ],
};
