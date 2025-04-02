import { useState, useCallback, useEffect } from 'react';
import * as gameLogic from './connect4Logic.new';

/**
 * Custom hook for Connect 4 game state management
 * This is a complete rewrite for cleaner, more reliable behavior
 * 
 * @returns {Object} Game state and actions
 */
export function useConnect4Game() {
  // Core game state
  const [board, setBoard] = useState(() => gameLogic.createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(gameLogic.PLAYER);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'win', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningSequences, setWinningSequences] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  
  // Game history for AI context
  const [moveHistory, setMoveHistory] = useState([]);
  
  // Game settings
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  
  // Game statistics
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('connect4_stats');
    return savedStats 
      ? JSON.parse(savedStats) 
      : { wins: 0, losses: 0, draws: 0 };
  });
  
  // Save stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('connect4_stats', JSON.stringify(stats));
  }, [stats]);
  
  // Update game status based on board state
  useEffect(() => {
    // Skip on initial render or when game is not playing
    if (!lastMove || gameStatus !== 'playing') return;
    
    // Check for win or draw
    const { status, winner, winningSequences: sequences } = gameLogic.getGameStatus(board);
    
    if (status !== 'playing') {
      setGameStatus(status);
      setWinner(winner);
      setWinningSequences(sequences);
      
      // Update stats
      if (status === 'win') {
        if (winner === gameLogic.PLAYER) {
          setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        } else {
          setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        }
      } else if (status === 'draw') {
        setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    }
  }, [board, gameStatus, lastMove]);
  
  /**
   * Make a move in the specified column
   * @param {number} column - Column to place disc in (0-6)
   * @returns {boolean} Whether the move was successful
   */
  const makeMove = useCallback((column) => {
    console.log(`Player attempting move in column ${column}`);
    
    // Ignore moves when game is not in progress or not the player's turn
    if (gameStatus !== 'playing' || currentPlayer !== gameLogic.PLAYER) {
      console.log('Move rejected: game not playing or not player turn', {gameStatus, currentPlayer});
      return false;
    }
    
    // Check if move is valid
    if (!gameLogic.isValidMove(board, column)) {
      console.log(`Move rejected: invalid move in column ${column}`);
      return false;
    }
    
    console.log(`Player making move in column ${column}`);
    
    // Place the disc
    const result = gameLogic.dropDisc(board, column, currentPlayer);
    
    // Update state
    setBoard(result.board);
    
    const moveData = {
      player: currentPlayer,
      row: result.row,
      column: result.column
    };
    
    setLastMove(moveData);
    
    // Update history
    setMoveHistory(prev => [
      ...prev, 
      { player: currentPlayer, column, row: result.row }
    ]);
    
    // We need to delay switching players to allow for animation
    // The animation takes about 700ms total with variable delay based on row
    // Let's use setTimeout to switch turn after animation completes
    console.log('Animation in progress, will switch to AI turn soon...');
    
    // First set a small timeout to allow React to render the updated board
    setTimeout(() => {
      console.log('Animation complete, switching to AI turn');
      // Switch player
      setCurrentPlayer(gameLogic.AI);
    }, 800); // Delay slightly longer than the animation duration (700ms)
    
    return true;
  }, [board, currentPlayer, gameStatus]);
  
  /**
   * Make a move for the AI
   * @param {number} column - Column to place disc in (0-6)
   * @returns {boolean} Whether the move was successful
   */
  const makeAIMove = useCallback((column) => {
    // Ignore moves when game is not in progress or not the AI's turn
    if (gameStatus !== 'playing' || currentPlayer !== gameLogic.AI) {
      return false;
    }
    
    // Check if move is valid
    if (!gameLogic.isValidMove(board, column)) {
      return false;
    }
    
    // Place the disc
    const result = gameLogic.dropDisc(board, column, currentPlayer);
    
    // Update state
    setBoard(result.board);
    setLastMove({
      player: currentPlayer,
      row: result.row,
      column: result.column
    });
    
    // Update history
    setMoveHistory(prev => [
      ...prev, 
      { player: currentPlayer, column, row: result.row }
    ]);
    
    // Switch player
    setCurrentPlayer(gameLogic.PLAYER);
    
    return true;
  }, [board, currentPlayer, gameStatus]);
  
  /**
   * Reset the game
   */
  const resetGame = useCallback(() => {
    console.log('Game reset');
    setBoard(gameLogic.createBoard());
    setCurrentPlayer(gameLogic.PLAYER);
    setGameStatus('playing');
    setWinner(null);
    setWinningSequences([]);
    setLastMove(null);
    setMoveHistory([]);
  }, []);
  
  /**
   * Get available columns for valid moves
   * @returns {Array<number>} Array of valid column indices
   */
  const getAvailableColumns = useCallback(() => {
    return gameLogic.getAvailableColumns(board);
  }, [board]);
  
  return {
    // State
    board,
    currentPlayer,
    gameStatus,
    winner,
    winningSequences,
    lastMove,
    moveHistory,
    difficulty,
    stats,
    
    // Actions
    makeMove,
    makeAIMove,
    resetGame,
    setDifficulty,
    getAvailableColumns,
    
    // Constants
    PLAYER: gameLogic.PLAYER,
    AI: gameLogic.AI
  };
}
