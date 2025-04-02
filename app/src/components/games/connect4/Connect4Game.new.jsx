import React from 'react';
import clsx from 'clsx';
import Connect4Board from './Connect4Board.new';
import Connect4Controls from './Connect4Controls.new';
import { useConnect4Game } from './useConnect4Game.new';
import { useConnect4AI } from './useConnect4AI.new';
import { PLAYER, AI } from './connect4Logic.new';

/**
 * Main Connect 4 game component
 * Integrates the board, controls, game state, and AI
 */
export default function Connect4Game() {
  // Game state and actions
  const game = useConnect4Game();
  
  // AI integration
  const { isThinking, commentary, error } = useConnect4AI(
    game,
    game.currentPlayer === AI && game.gameStatus === 'playing'
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
          {game.gameStatus === 'win' ? (
            <GameStatusText winner={game.winner} />
          ) : game.gameStatus === 'draw' ? (
            <span className="text-brandGray-300">Game Draw</span>
          ) : (
            <PlayerTurnIndicator
              isPlayerTurn={game.currentPlayer === PLAYER}
              isThinking={isThinking}
            />
          )}
        </div>
        <button 
          onClick={game.resetGame}
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
      {commentary && game.gameStatus === 'playing' && (
        <div className="mb-3 p-2 text-xs bg-brandGray-800 border border-brandGray-600 rounded-md overflow-hidden shadow-md">
          <div className="flex items-center gap-1 mb-1 text-brandGreen-400 text-xs font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-brandGreen-500 animate-pulse"></span>
            <span>AI thinking</span>
          </div>
          <p className="text-brandGray-300 leading-tight">
            {commentary}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 text-xs bg-brandGray-800 border border-brandOrange-700 rounded-md text-brandOrange-400 shadow-md">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-brandOrange-400">⚠️</span>
            <span className="font-medium">API Issue</span>
          </div>
          {error}
        </div>
      )}
      
      {/* Game board */}
      <Connect4Board 
        board={game.board}
        onColumnClick={game.makeMove}
        winningSequences={game.winningSequences}
        lastMove={game.lastMove}
        isActive={game.gameStatus === 'playing' && game.currentPlayer === PLAYER}
      />
      
      {/* Game status message for win/draw */}
      {game.gameStatus !== 'playing' && (
        <div 
          className={clsx(
            "my-2 py-2 px-3 text-center text-sm rounded-md animate-smooth-fade-in",
            game.winner === PLAYER
              ? "bg-brandOrange-900/30 text-brandOrange-300 border border-brandOrange-700/30"
              : game.winner === AI
              ? "bg-brandGreen-900/30 text-brandGreen-300 border border-brandGreen-700/30"
              : "bg-brandGray-800 text-brandGray-300 border border-brandGray-700"
          )}
        >
          {game.gameStatus === 'win' ? (
            <span>
              {game.winner === PLAYER ? 'You won! 🎉' : 'AI won this round!'}
            </span>
          ) : (
            <span>It's a draw! The board is full.</span>
          )}
        </div>
      )}
      
      {/* Game controls */}
      <Connect4Controls 
        difficulty={game.difficulty}
        setDifficulty={game.setDifficulty}
        gameStatus={game.gameStatus}
        stats={game.stats}
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
