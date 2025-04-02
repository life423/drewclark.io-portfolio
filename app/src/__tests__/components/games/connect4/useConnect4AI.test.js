/**
 * Connect4 AI Hook Tests
 * 
 * Tests the Connect4 AI implementation with focus on rate limiting
 * handling and exponential backoff.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useConnect4AI } from '../../../../components/games/connect4/useConnect4AI.js';
import * as gameLogic from '../../../../components/games/connect4/connect4Logic.js';

// Mock fetch
global.fetch = jest.fn();

// Mock setTimeout
jest.useFakeTimers();

// Setup mock game state
const createMockGameState = () => ({
  board: Array(6).fill().map(() => Array(7).fill(gameLogic.EMPTY)),
  moveHistory: [],
  difficulty: 'medium',
  gameStatus: 'playing',
  getAvailableColumns: jest.fn().mockReturnValue([0, 1, 2, 3, 4, 5, 6]),
  dropDisc: jest.fn()
});

describe('useConnect4AI hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });
  
  test('AI makes a move when it is its turn', async () => {
    // Setup successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        answer: '{"column": 3, "commentary": "I choose the middle"}'
      })
    });
    
    const mockGameState = createMockGameState();
    
    // Render the hook with isAITurn = true
    const { result, waitForNextUpdate } = renderHook(() => 
      useConnect4AI(mockGameState, true)
    );
    
    // Initial state
    expect(result.current.isThinking).toBe(true);
    expect(result.current.error).toBe(null);
    
    // Wait for useEffect to complete
    await waitForNextUpdate();
    
    // Advance timers to trigger the move after 600ms delay
    act(() => {
      jest.advanceTimersByTime(650);
    });
    
    // Verify AI made a move
    expect(mockGameState.dropDisc).toHaveBeenCalledWith(3);
    expect(result.current.aiCommentary).toBe("I choose the middle");
    expect(result.current.isThinking).toBe(false);
  });
  
  test('AI implements exponential backoff when rate limited', async () => {
    // First response is rate limited, second succeeds
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({
          error: 'Too many requests'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          answer: '{"column": 3, "commentary": "After retry"}'
        })
      });
    
    const mockGameState = createMockGameState();
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useConnect4AI(mockGameState, true)
    );
    
    // Wait for the first fetch to complete
    await waitForNextUpdate();
    
    // Verify error state is set
    expect(result.current.error).toContain("API rate limit reached");
    
    // Advance timers to trigger retry with backoff
    act(() => {
      jest.advanceTimersByTime(2100); // First retry after ~2000ms
    });
    
    // Wait for the retry fetch to complete
    await waitForNextUpdate();
    
    // Check that we called fetch twice (original + retry)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Advance timers to trigger the move
    act(() => {
      jest.advanceTimersByTime(650);
    });
    
    // Verify AI made a move after retry
    expect(mockGameState.dropDisc).toHaveBeenCalledWith(3);
    expect(result.current.aiCommentary).toBe("After retry");
  });
  
  test('AI uses local fallback strategy after multiple failed retries', async () => {
    // Mock 4 rate limited responses
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Too many requests' })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Too many requests' })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Too many requests' })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Too many requests' })
      });
    
    // Set up a game state with a winning move for AI
    const mockGameState = createMockGameState();
    
    // Mock a specific board state where AI can win
    const winningBoard = Array(6).fill().map(() => Array(7).fill(gameLogic.EMPTY));
    // Set up three AI pieces in a row with a potential win
    winningBoard[0][2] = gameLogic.AI;
    winningBoard[0][3] = gameLogic.AI;
    winningBoard[0][4] = gameLogic.AI;
    
    mockGameState.board = winningBoard;
    
    // Mock the winning logic
    jest.spyOn(gameLogic, 'dropDisc').mockImplementation((board, col, player) => {
      // If col is 5 (winning move), simulate a win
      if (col === 5 && player === gameLogic.AI) {
        return { board: winningBoard, row: 0 };
      }
      return { board: winningBoard, row: 0 };
    });
    
    jest.spyOn(gameLogic, 'checkWin').mockImplementation((board) => {
      // If looking at a position with AI disc at column 5, indicate a win
      if (board[0][5] === gameLogic.AI) {
        return { winner: gameLogic.AI };
      }
      return { winner: null };
    });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useConnect4AI(mockGameState, true)
    );
    
    // Wait for first fetch and all retries to complete
    await waitForNextUpdate();
    
    // Advance timers to complete all retries (exponential backoff)
    act(() => {
      jest.advanceTimersByTime(2000); // First retry
      jest.advanceTimersByTime(4000); // Second retry
      jest.advanceTimersByTime(8000); // Third retry
    });
    
    // Fast-forward 600ms timer for making the move
    act(() => {
      jest.advanceTimersByTime(650);
    });
    
    // Should have used fallback strategy and found the winning move
    expect(mockGameState.dropDisc).toHaveBeenCalledWith(5);
    expect(result.current.aiCommentary).toBe("I see a winning move!");
    expect(result.current.error).toContain("API rate limit reached");
    expect(result.current.isThinking).toBe(false);
  });
  
  test('AI uses caching to avoid duplicate requests', async () => {
    // First call succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        answer: '{"column": 3, "commentary": "First move"}'
      })
    });
    
    const mockGameState = createMockGameState();
    
    // Render the hook for first move
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ gameState, isAITurn }) => useConnect4AI(gameState, isAITurn),
      { initialProps: { gameState: mockGameState, isAITurn: true }}
    );
    
    // Wait for first move to complete
    await waitForNextUpdate();
    
    // Advance timer for the move
    act(() => {
      jest.advanceTimersByTime(650);
    });
    
    // Verify first move made
    expect(mockGameState.dropDisc).toHaveBeenCalledWith(3);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Reset mocks for second round
    mockGameState.dropDisc.mockClear();
    
    // Rerender with same board state (should use cache)
    rerender({ gameState: mockGameState, isAITurn: false });
    rerender({ gameState: mockGameState, isAITurn: true });
    
    // Advance timer for the cached move
    act(() => {
      jest.advanceTimersByTime(650);
    });
    
    // Verify move made, but no new fetch call (used cache)
    expect(mockGameState.dropDisc).toHaveBeenCalledWith(3);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only one fetch call
  });
});
