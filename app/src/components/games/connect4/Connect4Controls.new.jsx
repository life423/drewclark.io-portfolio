import React from 'react';
import clsx from 'clsx';

/**
 * Game controls component for Connect 4
 * Includes difficulty selector and game statistics
 */
export default function Connect4Controls({ 
  difficulty = 'medium',
  setDifficulty,
  stats = { wins: 0, losses: 0, draws: 0 },
  gameStatus = 'playing'
}) {
  const handleDifficultyChange = (newDifficulty) => {
    if (setDifficulty) {
      setDifficulty(newDifficulty);
    }
  };
  
  return (
    <div className="mt-4 text-sm">
      {/* Difficulty selector */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-brandGray-400">Difficulty:</span>
        
        <div className="flex space-x-1">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              className={clsx(
                "px-2 py-1 rounded-md text-xs capitalize transition-colors",
                difficulty === level 
                  ? 'bg-brandGray-700 text-white'
                  : 'bg-brandGray-800 text-brandGray-400 hover:bg-brandGray-700 hover:text-white',
                "border border-brandGray-700",
                "focus:outline-none focus:ring-1 focus:ring-brandGreen-500"
              )}
              onClick={() => handleDifficultyChange(level)}
              disabled={gameStatus !== 'playing'}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      
      {/* Game statistics */}
      <div className="bg-brandGray-850 rounded-md border border-brandGray-700 p-2">
        <div className="text-brandGray-400 text-xs mb-1">Game Statistics</div>
        
        <div className="grid grid-cols-3 gap-1 text-center">
          {/* Wins */}
          <div className="flex flex-col">
            <span className="text-brandOrange-400">{stats.wins}</span>
            <span className="text-xs text-brandGray-500">Wins</span>
          </div>
          
          {/* Losses */}
          <div className="flex flex-col">
            <span className="text-brandGreen-400">{stats.losses}</span>
            <span className="text-xs text-brandGray-500">Losses</span>
          </div>
          
          {/* Draws */}
          <div className="flex flex-col">
            <span className="text-brandGray-400">{stats.draws}</span>
            <span className="text-xs text-brandGray-500">Draws</span>
          </div>
        </div>
      </div>
      
      {/* Tips */}
      <div className="mt-2 text-xs text-brandGray-500">
        <p>Connect four of your discs vertically, horizontally, or diagonally to win!</p>
      </div>
    </div>
  );
}
