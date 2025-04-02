import React, { useState, useMemo } from 'react';
import Connect4Board from './Connect4Board';
import Connect4Controls from './Connect4Controls';
import { useConnect4Game } from './useConnect4Game';
import { useConnect4AI } from './useConnect4AI';
import { PLAYER, AI } from './connect4Logic';
import clsx from 'clsx';

/**
 * Main Connect 4 game component
 * Integrates the board, controls, and game logic
 */
export default function Connect4Game() {
  // Game state from custom hook
  const gameState = useConnect4Game();
  
  // Create memoized props with only essential data to avoid unnecessary rerenders
  const aiProps = useMemo(() => ({
    board: gameState.board,
    moveHistory: gameState.moveHistory,
    difficulty: gameState.difficulty,
    getAvailableColumns: gameState.getAvailableColumns
  }), [gameState.board, gameState.moveHistory, gameState.difficulty, gameState.getAvailableColumns]);
  
  // AI integration
  const { isThinking, aiCommentary, error } = useConnect4AI(
    gameState,
    gameState.currentPlayer === AI
  );
  
  return (
    <div 
      className="connect4-game flex flex-col w-full bg-brandGray-850 rounded-lg border border-brandGray-700 p-3 overflow-hidden"
      style={{
        // Better rendering on mobile
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {/* Game header with status */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-brandGray-300">
          {gameState.gameStatus === 'win' ? (
            <GameStatusText winner={gameState.winner} />
          ) : gameState.gameStatus === 'draw' ? (
            <span className="text-brandGray-300">Game Draw</span>
          ) : (
            <PlayerTurnIndicator
              isPlayerTurn={gameState.currentPlayer === PLAYER}
              isThinking={isThinking}
            />
          )}
        </div>
        <button 
          onClick={gameState.resetGame}
          className={clsx(
            "px-2 py-1 text-xs rounded-md transition-colors",
            "bg-brandGray-700 text-brandGray-300 hover:bg-brandGray-600 hover:text-white",
            "border border-brandGray-600",
            "focus:outline-none focus:ring-1 focus:ring-brandGreen-500"
          )}
        >
          New Game
        </button>
      </div>
      
      {/* AI commentary */}
      {aiCommentary && gameState.gameStatus === 'playing' && (
        <div className="mb-3 p-2 text-xs bg-brandGray-800 border border-brandGray-700 rounded-md overflow-hidden">
          <div className="flex items-center gap-1 mb-1 text-brandGreen-400 text-xs font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-brandGreen-500"></span>
            <span>AI thinking</span>
          </div>
          <p className="text-brandGray-300 leading-tight">
            {aiCommentary}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 text-xs bg-brandGray-800 border border-brandOrange-900 rounded-md text-brandOrange-400">
          {error}
        </div>
      )}
      
      {/* Game board */}
      <Connect4Board 
        board={gameState.board}
        onColumnClick={(col) => {
          if (gameState.currentPlayer === PLAYER && gameState.gameStatus === 'playing') {
            gameState.dropDisc(col);
          }
        }}
        winningCells={gameState.winningCells}
        lastMove={gameState.lastMove}
        isActive={gameState.gameStatus === 'playing' && gameState.currentPlayer === PLAYER}
      />
      
      {/* Game status message for win/draw */}
      {gameState.gameStatus !== 'playing' && (
        <div 
          className={clsx(
            "my-2 py-2 px-3 text-center text-sm rounded-md animate-smooth-fade-in",
            gameState.winner === PLAYER
              ? "bg-brandOrange-900/30 text-brandOrange-300 border border-brandOrange-700/30"
              : gameState.winner === AI
              ? "bg-brandGreen-900/30 text-brandGreen-300 border border-brandGreen-700/30"
              : "bg-brandGray-800 text-brandGray-300 border border-brandGray-700"
          )}
        >
          {gameState.gameStatus === 'win' ? (
            <span>
              {gameState.winner === PLAYER ? 'You won! 🎉' : 'AI won this round!'}
            </span>
          ) : (
            <span>It's a draw! The board is full.</span>
          )}
        </div>
      )}
      
      {/* Game controls */}
      <Connect4Controls 
        difficulty={gameState.difficulty}
        setDifficulty={gameState.setDifficulty}
        gameStatus={gameState.gameStatus}
        stats={gameState.stats}
      />
    </div>
  );
}

// Helper components for visual elements

function PlayerTurnIndicator({ isPlayerTurn, isThinking }) {
  return (
    <div className="flex items-center gap-1.5">
      {isPlayerTurn ? (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-brandOrange-500 animate-pulse-subtle"></span>
          <span className="text-brandOrange-300">Your Turn</span>
        </>
      ) : (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-brandGreen-500 animate-pulse-subtle"></span>
          <span className="text-brandGreen-300">
            {isThinking ? "AI thinking..." : "AI's Turn"}
          </span>
        </>
      )}
    </div>
  );
}

function GameStatusText({ winner }) {
  return (
    <span className={winner === PLAYER ? "text-brandOrange-300" : "text-brandGreen-300"}>
      {winner === PLAYER ? "You Won!" : "AI Won!"}
    </span>
  );
}
