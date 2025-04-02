import { useState, useEffect, useCallback, useRef } from 'react';
import { sharedApiService, CATEGORY, PRIORITY } from '../../../services/sharedApiService';
import * as gameLogic from './connect4Logic';

/**
 * Format the board state for AI prompt
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {string} Formatted board representation
 */
function formatBoardForAI(board) {
  return board.map(row => 
    row.map(cell => 
      cell === gameLogic.EMPTY ? '⚪' : 
      cell === gameLogic.PLAYER ? '🔴' : '🟡'
    ).join('')
  ).join('\n');
}

/**
 * Format move history for AI context
 * @param {Array<Object>} history - Game move history
 * @returns {string} Formatted move history
 */
function formatMoveHistory(history) {
  if (!history.length) return 'No moves yet.';
  
  return history.map((move, i) => 
    `Move ${i+1}: ${move.player === gameLogic.PLAYER ? 'Human' : 'AI'} placed in column ${move.column}`
  ).join('\n');
}

/**
 * Get commentary based on difficulty level
 * @param {string} difficulty - Game difficulty level
 * @returns {string} Prompt addition for commentary
 */
function getDifficultyPrompt(difficulty) {
  switch(difficulty) {
    case 'easy':
      return `You are playing at an EASY difficulty level. Make suboptimal moves occasionally,
      but still try to block obvious winning moves by the human. Keep commentary friendly and encouraging.`;
    case 'hard':
      return `You are playing at a HARD difficulty level. Make the optimal move to win whenever possible,
      and always block the human's winning moves. Use more advanced strategy. 
      Commentary should reflect strategic thinking.`;
    case 'medium':
    default:
      return `You are playing at a MEDIUM difficulty level. Make reasonably good moves, 
      but occasionally miss complex strategies. Commentary should be helpful but not too advanced.`;
  }
}

/**
 * Custom hook for Connect 4 AI integration
 * @param {Object} gameState - Current game state from useConnect4Game
 * @param {boolean} isAITurn - Whether it's currently the AI's turn
 * @returns {Object} AI state and functions
 */
export function useConnect4AI(gameState, isAITurn) {
  const [isThinking, setIsThinking] = useState(false);
  const [aiCommentary, setAiCommentary] = useState('');
  const [error, setError] = useState(null);
  
  // Track current request to allow cancellation
  const abortControllerRef = useRef(null);
  
  // Track if we're already processing in this render cycle
  const processingTurnRef = useRef(false);
  
  // Track request ID for the current AI turn
  const [requestId, setRequestId] = useState(0);
  
  // Track retry state
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState(null);
  
  // Function to get AI move using the shared API service
  const getAIMove = useCallback(async () => {
    console.log("getAIMove called, checking game state");
    
    // Extract properties from gameState
    const { board, moveHistory, difficulty, getAvailableColumns, gameStatus } = gameState;
    const availableColumns = getAvailableColumns();
    
    // Log board state for debugging
    console.log("Current board state:", board);
    console.log("Available columns:", availableColumns);
    
    if (availableColumns.length === 0 || gameStatus !== 'playing') {
      console.log("No available columns or game not playing, skipping AI move");
      return null;
    }
    
    // Skip if already processing (prevents double execution in React StrictMode)
    if (processingTurnRef.current) {
      console.log("Already processing an AI move, skipping");
      return null;
    }
    
    // Set processing flag and thinking state
    console.log("Setting processingTurnRef to true");
    processingTurnRef.current = true;
    setIsThinking(true);
    setError(null);
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      console.log("Aborting previous request");
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller and increment request ID
    const currentRequestId = requestId + 1;
    console.log("Setting new requestId:", currentRequestId);
    setRequestId(currentRequestId);
    abortControllerRef.current = new AbortController();
    
    try {
      // Create the prompt for the AI
      const prompt = `
You are playing Connect 4 against a human player. You are playing with yellow discs (🟡).
Current board state (bottom row is row 0):
${formatBoardForAI(board)}

Game move history:
${formatMoveHistory(moveHistory)}

${getDifficultyPrompt(difficulty)}

Available columns: ${availableColumns.join(', ')}

Respond with ONLY a JSON object in this exact format:
{
  "column": [chosen column number 0-6],
  "commentary": "[brief strategic thinking]"
}
`;

      console.log("Sending request to AI service");
      // Use the shared API service instead of direct fetch
      const data = await sharedApiService.enqueueRequest({
        body: {
          question: prompt,
          maxTokens: 150,
          temperature: 0.7,
          model: "gpt-4o-mini"
        },
        category: CATEGORY.CONNECT4,
        priority: PRIORITY.MEDIUM,
        signal: abortControllerRef.current.signal
      });
      
      console.log("Got response from AI service:", data);
      
      // Check if this is still the most recent request or if component unmounted
      if (currentRequestId !== requestId) {
        console.log("This is not the most recent request, discarding response");
        processingTurnRef.current = false; // Reset processing flag even for discarded requests
        return null;
      }
      
      // Parse the AI's response to extract column choice and commentary
      try {
        // Safety: extract just the JSON part from response
        const jsonMatch = data.answer.match(/\{[\s\S]*\}/);
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        
        console.log("Parsed AI response:", result);
        
        // Reset retry count on successful requests
        if (retryCount > 0) {
          setRetryCount(0);
        }
        
        if (result && 
            typeof result.column === 'number' && 
            result.column >= 0 && 
            result.column < gameLogic.COLS &&
            availableColumns.includes(result.column)) {
          console.log("AI chose valid column:", result.column);
          return {
            column: result.column,
            commentary: result.commentary || "Let me think about this move..."
          };
        } else {
          // If parsing fails or invalid column, use a random available column
          console.log("AI returned invalid column, using fallback");
          const fallbackColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
          return {
            column: fallbackColumn,
            commentary: "I'll try this move."
          };
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        // Fallback to a random strategy
        const fallbackColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        return {
          column: fallbackColumn, 
          commentary: "I'll make this move."
        };
      }
    } catch (error) {
      // Ignore aborted requests
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        processingTurnRef.current = false; // Reset processing flag for aborted requests
        return null;
      }
      
      console.error("Error getting AI move:", error);
      
      if (error.message && error.message.includes("Rate limit")) {
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
        console.log(`Rate limited. Retrying in ${backoffTime/1000} seconds`);
        
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        
        // Set up retry with exponential backoff
        const timeoutId = setTimeout(() => {
          if (gameState.gameStatus === 'playing' && isAITurn) {
            console.log("Retrying AI move after backoff");
            setRetryCount(prev => prev + 1);
            processingTurnRef.current = false; // Allow the next attempt
            getAIMove();
          } else {
            console.log("Game state changed during backoff, not retrying");
            processingTurnRef.current = false;
          }
        }, backoffTime);
        
        setRetryTimeout(timeoutId);
        setError(`Rate limit reached. Retrying in ${backoffTime/1000} seconds...`);
        return null;
      }
      
      // Use a more intelligent fallback strategy
      console.log("Using intelligent fallback strategy");
      const availableColumns = gameState.getAvailableColumns();
      let fallbackColumn;
      let commentary = "";
      
      // 1. Check if AI can win in one move
      for (const col of availableColumns) {
        const { board: testBoard, row } = gameLogic.dropDisc(board, col, gameLogic.AI);
        if (row !== -1) {
          const { winner } = gameLogic.checkWin(testBoard);
          if (winner === gameLogic.AI) {
            fallbackColumn = col;
            commentary = "I see a winning move!";
            break;
          }
        }
      }
      
      // 2. Check if player can win in one move (block them)
      if (fallbackColumn === undefined) {
        for (const col of availableColumns) {
          const { board: testBoard, row } = gameLogic.dropDisc(board, col, gameLogic.PLAYER);
          if (row !== -1) {
            const { winner } = gameLogic.checkWin(testBoard);
            if (winner === gameLogic.PLAYER) {
              fallbackColumn = col;
              commentary = "I'll block your winning move.";
              break;
            }
          }
        }
      }
      
      // 3. Prefer center column if available
      if (fallbackColumn === undefined && availableColumns.includes(3)) {
        fallbackColumn = 3;
        commentary = "I'll take the center column.";
      }
      
      // 4. Otherwise choose randomly
      if (fallbackColumn === undefined) {
        fallbackColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        commentary = "I'll try this move.";
      }
      
      // Set an error message in the UI
      if (error.message.includes("Rate limit")) {
        setError("API rate limit reached. Using local AI strategy.");
      } else {
        setError("Connection issue. Using local AI strategy.");
      }
      
      return {
        column: fallbackColumn,
        commentary: commentary
      };
    } finally {
      console.log("AI move processing complete, setting thinking to false");
      setIsThinking(false);
      // Don't reset processingTurnRef here - it will be reset after the move is made
    }
  }, [
    // Only depend on the specific properties we use
    gameState.board, 
    gameState.moveHistory, 
    gameState.difficulty, 
    gameState.getAvailableColumns,
    gameState.gameStatus,
    isAITurn,
    requestId,
    retryCount,
    retryTimeout
  ]);
  
  // Handle AI turns
  useEffect(() => {
    console.log("AI turn effect running, isAITurn:", isAITurn, "gameStatus:", gameState.gameStatus);
    
    let isMounted = true;
    let moveTimeoutId = null;
    
    async function handleAITurn() {
      // Skip if already processing
      if (processingTurnRef.current) {
        console.log("Skip handleAITurn - already processing");
        return;
      }
      
      if (isAITurn && gameState.gameStatus === 'playing') {
        console.log("It's AI's turn and game is playing - getting AI move");
        const aiDecision = await getAIMove();
        
        if (!isMounted) {
          console.log("Component unmounted during AI processing");
          return;
        }
        
        if (!aiDecision) {
          console.log("No AI decision received");
          processingTurnRef.current = false; // Reset processing flag if no decision was made
          return;
        }
        
        console.log("Setting AI commentary:", aiDecision.commentary);
        setAiCommentary(aiDecision.commentary);
        
        // Small delay before making the move for a more natural feel
        console.log("Scheduling AI move in 600ms to column:", aiDecision.column);
        moveTimeoutId = setTimeout(() => {
          if (!isMounted) {
            console.log("Component unmounted during move timeout");
            return;
          }
          
          if (gameState.gameStatus !== 'playing') {
            console.log("Game no longer playing, skipping AI move");
            processingTurnRef.current = false; // Reset processing flag
            return;
          }
          
          console.log("Executing AI move to column:", aiDecision.column);
          // Use the dropDisc function from the props
          gameState.dropDisc(aiDecision.column);
          
          // Reset the processing flag AFTER the move is made
          console.log("Resetting processingTurnRef to false after move");
          processingTurnRef.current = false;
        }, 600);
      } else {
        // Not AI's turn or game not playing, ensure flag is reset
        if (processingTurnRef.current) {
          console.log("Not AI's turn but processing flag is true - resetting");
          processingTurnRef.current = false;
        }
      }
    }
    
    handleAITurn();
    
    // Proper cleanup
    return () => {
      console.log("Cleaning up AI turn effect");
      isMounted = false;
      
      // Cancel any pending API requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear timeouts
      if (moveTimeoutId) {
        clearTimeout(moveTimeoutId);
      }
      
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      
      // Always reset the processing flag on cleanup
      processingTurnRef.current = false;
    };
  }, [isAITurn, gameState.gameStatus, getAIMove]);
  
  return {
    isThinking,
    aiCommentary,
    error
  };
}
