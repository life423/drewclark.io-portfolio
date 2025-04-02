/**
 * Jest Setup File
 * 
 * This file runs before all tests to set up the testing environment.
 */

// Set up fetch mock
import 'jest-fetch-mock';

// Enable fetch mocks
global.fetch = require('jest-fetch-mock');

// Set up mocks for browser globals
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Mock timing functions
jest.useFakeTimers();

// Make a dummy React implementation for tests
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((init) => [init, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
  useCallback: jest.fn((fn) => fn),
  useRef: jest.fn((value) => ({ 
    current: value,
    // Add the Map methods to make the cache work
    has: jest.fn(() => false),
    get: jest.fn(() => null),
    set: jest.fn(),
  }))
}));
