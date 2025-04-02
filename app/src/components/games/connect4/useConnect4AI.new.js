import { useState, useCallback, useEffect, useRef } from 'react';
import { sharedApiService, CATEGORY, PRIORITY } from '../../../services/sharedApiService';
import * as gameLogic from './connect4Logic.new';

/**
 * Format the board for AI prompt
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {string} Formatted board representation
 */
function formatBoardForAI(board) {
  // Create a copy and reverse it for prettier display (bottom row at the bottom)
  const displayBoard = [...board].reverse();
  
  return displayBoard.map(row => 
    row.map(cell => 
      cell === gameLogic.EMPTY ? '⚪' : 
      cell === gameLogic.PLAYER ? '🔴' : '🟡'
    ).join('')
  ).join('\n');
}

/**
 * Format move history for AI context
 * @param {Array<{player: string, column: number, row: number}>} history - Game move history
 * @returns {string} Formatted move history
 */
function formatMoveHistory(history) {
  if (!history || history.length === 0) return 'No moves played yet.';
  
  return history.map((move, index) => 
    `Move ${index + 1}: ${move.player === gameLogic.PLAYER ? 'Human' : 'AI'} placed in column ${move.column + 1}`
  ).join('\n');
}

/**
 * Get difficulty-specific prompt text
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns {string} Difficulty prompt text
 */
function getDifficultyPrompt(difficulty) {
  switch(difficulty) {
    case 'easy':
      return `You are playing at an EASY difficulty level. Make suboptimal moves occasionally
and don't always block the player's winning moves. Keep commentary simple and encouraging.`;
    
    case 'hard':
      return `You are playing at a HARD difficulty level. Make the optimal move to win whenever possible
and always block the player's winning moves. Use more advanced strategy such as setting up
multiple threats. Commentary should reflect strategic thinking.`;
    
    case 'medium':
    default:
      return `You are playing at a MEDIUM difficulty level. Make reasonably good moves
but occasionally miss complex strategies. Commentary should be helpful but not too advanced.`;
  }
}

/**
 * Create AI prompt for current game state
 * @param {Array<Array<string|null>>} board - Current board state
 * @param {Array} moveHistory - Game move history
 * @param {string} difficulty - Difficulty level
 * @returns {string} AI prompt
 */
function createAIPrompt(board, moveHistory, difficulty) {
  return `
You are playing Connect 4 against a human player. You are playing with yellow discs (🟡).
Current board state (bottom row is row 1, top row is row 6):
${formatBoardForAI(board)}

Game move history:
${formatMoveHistory(moveHistory)}

${getDifficultyPrompt(difficulty)}

Respond with ONLY a JSON object in this exact format:
{
  "column": [chosen column number 0-6],
  "commentary": "[brief strategic thinking]"
}
`;
}

/**
 * Extract valid move from AI response
 * @param {Object} response - API response
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {Object} Parsed AI move
 */
function parseAIResponse(response, board) {
  try {
    // Extract JSON from response
    const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    // Validate the result
    if (result && 
        typeof result.column === 'number' && 
        result.column >= 0 && 
        result.column < gameLogic.COLS &&
        gameLogic.isValidMove(board, result.column)) {
      
      return {
        column: result.column,
        commentary: result.commentary || "Let me think about this move..."
      };
    }
    
    // If invalid, use fallback
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    
    // Use fallback strategy
    const column = gameLogic.findBestMove(board, gameLogic.AI, gameLogic.PLAYER);
    return {
      column,
      commentary: "I'll try this move."
    };
  }
}

/**
 * Custom hook for Connect 4 AI integration
 * @param {Object} gameState - Game state from useConnect4Game
 * @param {boolean} isAITurn - Whether it's the AI's turn
 * @returns {Object} AI state and methods
 */
export function useConnect4AI(gameState, isAITurn) {
  // Extract values from game state
  const { 
    board, 
    makeAIMove, 
    gameStatus,
    difficulty,
    moveHistory
  } = gameState;
  
  // AI state
  const [isThinking, setIsThinking] = useState(false);
  const [commentary, setCommentary] = useState('');
  const [error, setError] = useState(null);
  
  // References for request management
  const abortControllerRef = useRef(null);
  const isMakingMoveRef = useRef(false);
  const requestIdRef = useRef(0);
  
  // Retry state
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef(null);
  
  // Effect to handle AI turns
  useEffect(() => {
    // Only process when it's the AI's turn and game is playing
    if (!isAITurn || gameStatus !== 'playing') {
      console.log('AI turn skipped:', { isAITurn, gameStatus, isMakingMove: isMakingMoveRef.current });
      return;
    }
    
    if (isMakingMoveRef.current) {
      console.log('AI already making a move, skipping duplicate call');
      return;
    }
    
    console.log('AI turn detected, preparing to make move...');
    
    let isMounted = true;
    
    const getAIMove = async () => {
      // Prevent concurrent requests
      isMakingMoveRef.current = true;
      setIsThinking(true);
      console.log('AI thinking started');
      
      try {
        // Use deterministic strategy for specific situations to reduce API calls:
        
        // 1. Always use local AI for first few moves to save API calls
        if (moveHistory.length < 3) {
          const column = moveHistory.length === 0
            ? 3 // Always start in the center column for optimal play
            : gameLogic.findBestMove(board, gameLogic.AI, gameLogic.PLAYER);
          
          let commentary = "";
          if (moveHistory.length === 0) {
            commentary = "I'll start in the center column for better control.";
          } else if (moveHistory.length === 1) {
            commentary = "Let me respond to your first move.";
          } else {
            commentary = "I'm developing my strategy...";
          }
          
          setCommentary(commentary);
          
          // Small delay for natural feeling
          await new Promise(resolve => setTimeout(resolve, 700));
          
          if (isMounted) {
            makeAIMove(column);
          }
          
          return;
        }
        
        // 2. Always use local AI for easy difficulty (no need to waste API calls)
        if (difficulty === 'easy') {
          // For easy mode, occasionally make non-optimal moves
          const availableColumns = getAvailableColumns();
          let column;
          
          // 30% chance of random move in easy mode
          if (Math.random() < 0.3) {
            column = availableColumns[Math.floor(Math.random() * availableColumns.length)];
            setCommentary("I'll try this move!");
          } else {
            column = gameLogic.findBestMove(board, gameLogic.AI, gameLogic.PLAYER);
            setCommentary("This looks like a good move.");
          }
          
          // Small delay for natural feeling
          await new Promise(resolve => setTimeout(resolve, 700));
          
          if (isMounted) {
            makeAIMove(column);
          }
          
          return;
        }
        
        // 3. Check for immediate win conditions locally before API call
        const availableColumns = getAvailableColumns();
        
        // Check if AI can win in one move
        for (const col of availableColumns) {
          const testBoard = JSON.parse(JSON.stringify(board)); // Deep copy
          const { board: updatedBoard } = gameLogic.dropDisc(testBoard, col, gameLogic.AI);
          const { winner } = gameLogic.checkWin(updatedBoard);
          
          if (winner === gameLogic.AI) {
            setCommentary("I see a winning move!");
            
            // Small delay for natural feeling
            await new Promise(resolve => setTimeout(resolve, 600));
            
            if (isMounted) {
              makeAIMove(col);
            }
            
            return;
          }
        }
        
        // 4. Check if player can win in one move and block (medium and hard difficulties)
        for (const col of availableColumns) {
          const testBoard = JSON.parse(JSON.stringify(board)); // Deep copy
          const { board: updatedBoard } = gameLogic.dropDisc(testBoard, col, gameLogic.PLAYER);
          const { winner } = gameLogic.checkWin(updatedBoard);
          
          if (winner === gameLogic.PLAYER) {
            setCommentary("I need to block your winning move!");
            
            // Small delay for natural feeling
            await new Promise(resolve => setTimeout(resolve, 600));
            
            if (isMounted) {
              makeAIMove(col);
            }
            
            return;
          }
        }
        
        // Only use OpenAI API for medium/hard difficulty in non-trivial positions
        
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // Create a new abort controller
        abortControllerRef.current = new AbortController();
        const currentRequestId = requestIdRef.current + 1;
        requestIdRef.current = currentRequestId;
        
        // Create AI prompt
        const prompt = createAIPrompt(board, moveHistory, difficulty);
        
        // Make API request
        const data = await sharedApiService.enqueueRequest({
          body: {
            question: prompt,
            maxTokens: 150,
            temperature: 0.7
          },
          category: CATEGORY.CONNECT4,
          priority: PRIORITY.MEDIUM,
          signal: abortControllerRef.current.signal
        });
        
        // Check if this is still the most recent request
        if (currentRequestId !== requestIdRef.current || !isMounted) {
          return;
        }
        
        // Process response
        const aiDecision = parseAIResponse(data, board);
        
        // Update state
        setCommentary(aiDecision.commentary);
        
        // Reset retry count on success
        if (retryCount > 0) {
          setRetryCount(0);
        }
        
        // Small delay for more natural feeling
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Make the move
        if (isMounted) {
          makeAIMove(aiDecision.column);
        }
      } catch (error) {
        // Handle aborted requests
        if (error.name === 'AbortError') {
          console.log('AI request was cancelled');
          return;
        }
        
        console.error('Error getting AI move:', error);
        
        // Handle rate limiting
        if (error.message && error.message.includes('Rate limit')) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setError(`Rate limited. Retrying in ${backoffTime/1000} seconds...`);
          
          // Clear previous timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          
          // Set up retry
          if (isMounted) {
            retryTimeoutRef.current = setTimeout(() => {
              if (isMounted && gameStatus === 'playing' && isAITurn) {
                setRetryCount(prev => prev + 1);
                isMakingMoveRef.current = false;
                getAIMove();
              }
            }, backoffTime);
          }
          
          return;
        }
        
        // Fallback to local AI strategy
        try {
          setError('Using fallback AI strategy.');
          
          const column = gameLogic.findBestMove(board, gameLogic.AI, gameLogic.PLAYER);
          setCommentary("I'll make this move instead.");
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          if (isMounted) {
            makeAIMove(column);
          }
        } catch (fallbackError) {
          console.error('Fallback AI strategy failed:', fallbackError);
          setError('AI move failed. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsThinking(false);
          isMakingMoveRef.current = false;
        }
      }
    };
    
    // Execute AI move
    getAIMove();
    
    // Cleanup function
    return () => {
      isMounted = false;
      
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any pending timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    isAITurn,
    board,
    makeAIMove,
    gameStatus,
    difficulty,
    moveHistory,
    retryCount
  ]);
  
  // Clear error when not AI's turn
  useEffect(() => {
    if (!isAITurn && error) {
      setError(null);
    }
  }, [isAITurn, error]);
  
  return {
    isThinking,
    commentary,
    error
  };
}
