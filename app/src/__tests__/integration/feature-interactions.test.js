/**
 * Feature Interaction Tests
 * 
 * Tests the interaction between different features (Connect4 AI and Project Cards)
 * to ensure they don't interfere with each other's rate limits.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useConnect4AI } from '../../components/games/connect4/useConnect4AI.js';
import { answerProjectQuestion } from '../../services/aiGenerationService.js';
import * as gameLogic from '../../components/games/connect4/connect4Logic.js';

// Mock fetch
global.fetch = jest.fn();

// Mock setTimeout
jest.useFakeTimers();

// Setup mock game state for Connect4
const createMockGameState = () => ({
  board: Array(6).fill().map(() => Array(7).fill(gameLogic.EMPTY)),
  moveHistory: [],
  difficulty: 'medium',
  gameStatus: 'playing',
  getAvailableColumns: jest.fn().mockReturnValue([0, 1, 2, 3, 4, 5, 6]),
  dropDisc: jest.fn()
});

// Mock project data for Project Card
const mockProjectData = {
  id: 'project-1',
  title: 'Test Project',
  summary: 'A test project',
  stack: ['React', 'Node.js'],
  initialDescription: 'This is a test project description'
};

describe('Feature Interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    console.error = jest.fn(); // Suppress expected error logs
  });
  
  test('Connect4 rate limit does not affect Project Card questions', async () => {
    // Setup: Connect4 hits rate limit
    global.fetch
      // First call for Connect4 (rate limited)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ 
          error: 'Too many requests',
          feature: 'connect4'
        })
      })
      // Second call for Project Card (should succeed)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          answer: 'Project information response'
        })
      });
    
    // Part 1: Render Connect4 hook and trigger rate limit
    const mockGameState = createMockGameState();
    
    const { result: connect4Result, waitForNextUpdate: waitForConnect4 } = 
      renderHook(() => useConnect4AI(mockGameState, true));
    
    // Wait for Connect4 rate limit response
    await waitForConnect4();
    
    // Verify Connect4 hit rate limit
    expect(connect4Result.current.error).toContain('API rate limit reached');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/api/askGPT/connect4');
    
    // Part 2: Make Project Card request
    const projectPromise = answerProjectQuestion(
      mockProjectData, 
      'Tell me about this project'
    );
    
    // Resolve the promise
    const projectResponse = await projectPromise;
    
    // Verify Project Card request worked
    expect(projectResponse).toBe('Project information response');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[1][0]).toContain('/api/askGPT/projects');
  });
  
  test('Simultaneous requests from different features work independently', async () => {
    // Setup: Both APIs succeed
    global.fetch
      // Mock response for whichever comes first
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          answer: '{"column": 3, "commentary": "Connect4 move"}'
        })
      })
      // Mock response for the second call
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          answer: 'Project information response'
        })
      });
    
    // Start both requests "simultaneously"
    const mockGameState = createMockGameState();
    
    // Part 1: Render Connect4 hook
    const { result: connect4Result, waitForNextUpdate: waitForConnect4 } = 
      renderHook(() => useConnect4AI(mockGameState, true));
    
    // Part 2: Make Project Card request immediately after
    const projectPromise = answerProjectQuestion(
      mockProjectData, 
      'Tell me about this project'
    );
    
    // Wait for Connect4 to finish
    await waitForConnect4();
    
    // Verify Connect4 worked
    expect(connect4Result.current.aiCommentary).toBe('Connect4 move');
    
    // Resolve the Project Card promise
    const projectResponse = await projectPromise;
    
    // Verify Project Card request worked
    expect(projectResponse).toBe('Project information response');
    
    // Verify both requests were made to their specific endpoints
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify endpoints were correct (order might vary)
    const callUrls = global.fetch.mock.calls.map(call => call[0]);
    expect(callUrls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/api/askGPT/connect4'),
        expect.stringContaining('/api/askGPT/projects')
      ])
    );
  });
  
  test('Visual regression testing: Error states display correctly', async () => {
    // This would typically be an integration test with React Testing Library or Cypress,
    // but for this example we'll use a simple mock approach
    
    // Mock fetch to simulate rate limit for Connect4
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ 
        error: 'Too many requests',
        feature: 'connect4',
        recommendedWait: '10 seconds'
      })
    });
    
    // Render the Connect4 hook
    const mockGameState = createMockGameState();
    const { result, waitForNextUpdate } = renderHook(() => 
      useConnect4AI(mockGameState, true)
    );
    
    // Wait for rate limit response
    await waitForNextUpdate();
    
    // Verify error state is set correctly for display
    expect(result.current.error).toContain('API rate limit reached');
    expect(result.current.isThinking).toBe(false);
    
    // In a real visual regression test, we would validate:
    // 1. Error message is visible to the user
    // 2. Retry mechanism is indicated in the UI
    // 3. Fallback AI strategy is communicated to the user
  });
});
