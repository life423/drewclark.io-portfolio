import { useState, useCallback, useEffect } from 'react';
import * as gameLogic from './connect4Logic';

/**
 * Custom hook for Connect 4 game state management
 * @param {Object} options - Configuration options
 * @param {function} options.onGameStateChange - Callback when game state changes
 * @returns {Object} Game state and actions
 */
export function useConnect4Game({ onGameStateChange } = {}) {
  // Game board state
  const [board, setBoard] = useState(() => gameLogic.createEmptyBoard());
  
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState(gameLogic.PLAYER);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'win', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState(null);
  
  // Move history for AI context
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  
  // Game settings
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  
  // Game statistics
  const [stats, setStats] = useState(() => {
    // Load stats from localStorage if available
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
    const { status, winner, winningCells } = gameLogic.getGameStatus(board);
    
    if (status !== gameStatus) {
      setGameStatus(status);
      setWinner(winner);
      setWinningCells(winningCells);
      
      // Update stats when game ends
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
  }, [board, gameStatus]);
  
  // Notify parent component of game state changes
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange({
        board,
        currentPlayer,
        gameStatus,
        winner,
        winningCells,
        lastMove,
        moveHistory,
        difficulty
      });
    }
  }, [board, currentPlayer, gameStatus, winner, winningCells, lastMove, moveHistory, difficulty, onGameStateChange]);
  
  // Drop a disc in a column
  const dropDisc = useCallback((col) => {
    console.log(`dropDisc called for column ${col}, gameStatus: ${gameStatus}, currentPlayer: ${currentPlayer}`);
    
    if (gameStatus !== 'playing') {
      console.log('Game not in playing state, ignoring move');
      return false;
    }
    
    setBoard(currentBoard => {
      // Check if move is valid
      if (!gameLogic.isValidMove(currentBoard, col)) {
        console.log(`Move to column ${col} is invalid`);
        return currentBoard;
      }
      
      console.log(`Move to column ${col} is valid, dropping disc`);
      
      // Drop the disc and get the new board state
      const { board: newBoard, row } = gameLogic.dropDisc(currentBoard, col, currentPlayer);
      
      // Track the move
      if (row !== -1) {
        console.log(`Disc placed at row ${row}, column ${col}`);
        const move = { player: currentPlayer, column: col, row };
        
        console.log('Setting lastMove:', move);
        setLastMove(move);
        
        console.log('Updating moveHistory');
        setMoveHistory(prev => [...prev, move]);
        
        // Switch players - do this OUTSIDE the setBoard callback to ensure it happens
        setTimeout(() => {
          console.log(`Switching player from ${currentPlayer} to ${currentPlayer === gameLogic.PLAYER ? gameLogic.AI : gameLogic.PLAYER}`);
          setCurrentPlayer(current => 
            current === gameLogic.PLAYER ? gameLogic.AI : gameLogic.PLAYER
          );
        }, 10);
      } else {
        console.log('Failed to place disc, possibly column is full');
      }
      
      return newBoard;
    });
    
    return true;
  }, [gameStatus, currentPlayer]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setBoard(gameLogic.createEmptyBoard());
    setCurrentPlayer(gameLogic.PLAYER);
    setGameStatus('playing');
    setWinner(null);
    setWinningCells(null);
    setLastMove(null);
    setMoveHistory([]);
  }, []);
  
  // Get available columns for moves
  const getAvailableColumns = useCallback(() => {
    return gameLogic.getAvailableColumns(board);
  }, [board]);
  
  return {
    // Game state
    board,
    currentPlayer,
    gameStatus,
    winner,
    winningCells,
    lastMove,
    moveHistory,
    difficulty,
    stats,
    
    // Game actions
    dropDisc,
    resetGame,
    setDifficulty,
    getAvailableColumns
  };
}
