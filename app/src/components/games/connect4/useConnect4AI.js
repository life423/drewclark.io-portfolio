import { useState, useEffect, useCallback } from 'react';
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
  
  // Function to get AI move using OpenAI API
  const getAIMove = useCallback(async () => {
    const { board, moveHistory, difficulty } = gameState;
    const availableColumns = gameState.getAvailableColumns();
    
    if (availableColumns.length === 0) return null;
    
    setIsThinking(true);
    setError(null);
    
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

      // Call the backend API
      const response = await fetch('/api/askGPT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: prompt,
          maxTokens: 150,
          temperature: 0.7,
          model: "gpt-4o-mini"
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the AI's response to extract column choice and commentary
      try {
        // Safety: extract just the JSON part from response
        const jsonMatch = data.answer.match(/\{[\s\S]*\}/);
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        
        if (result && 
            typeof result.column === 'number' && 
            result.column >= 0 && 
            result.column < gameLogic.COLS &&
            availableColumns.includes(result.column)) {
          return {
            column: result.column,
            commentary: result.commentary || "Let me think about this move..."
          };
        } else {
          // If parsing fails or invalid column, use a random available column
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
      console.error("Error getting AI move:", error);
      
      // Use a more intelligent fallback strategy
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
      setIsThinking(false);
    }
  }, [gameState]);
  
  // Handle AI turns
  useEffect(() => {
    let isMounted = true;
    
    async function handleAITurn() {
      if (isAITurn && gameState.gameStatus === 'playing') {
        const aiDecision = await getAIMove();
        
        if (!isMounted || !aiDecision) return;
        
        setAiCommentary(aiDecision.commentary);
        
        // Small delay before making the move for a more natural feel
        setTimeout(() => {
          if (isMounted && gameState.gameStatus === 'playing') {
            gameState.dropDisc(aiDecision.column);
          }
        }, 600);
      }
    }
    
    handleAITurn();
    
    return () => {
      isMounted = false;
    };
  }, [isAITurn, gameState, getAIMove]);
  
  return {
    isThinking,
    aiCommentary,
    error
  };
}
