import React from 'react';
import clsx from 'clsx';

/**
 * Game controls component for Connect 4
 * Provides difficulty settings and new game button
 */
export default function Connect4Controls({
  difficulty = 'medium',
  setDifficulty,
  gameStatus = 'playing',
  stats = { wins: 0, losses: 0, draws: 0 }
}) {
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    if (setDifficulty) {
      setDifficulty(newDifficulty);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* Game statistics */}
      <div className="flex justify-between text-xs text-brandGray-400">
        <div className="flex gap-3">
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-brandOrange-500 mr-1"></span>
            <span className="text-brandOrange-300">{stats.wins}</span>
          </span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-brandGreen-500 mr-1"></span>
            <span className="text-brandGreen-300">{stats.losses}</span>
          </span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-brandGray-500 mr-1"></span>
            <span>{stats.draws}</span>
          </span>
        </div>
        <span className="text-brandGray-500 italic">AI Powered</span>
      </div>
      
      {/* Difficulty settings */}
      <div className="flex gap-1 mt-1">
        <DifficultyButton 
          label="Easy" 
          value="easy" 
          isActive={difficulty === 'easy'} 
          onClick={() => handleDifficultyChange('easy')}
        />
        <DifficultyButton 
          label="Medium" 
          value="medium" 
          isActive={difficulty === 'medium'} 
          onClick={() => handleDifficultyChange('medium')}
        />
        <DifficultyButton 
          label="Hard" 
          value="hard" 
          isActive={difficulty === 'hard'} 
          onClick={() => handleDifficultyChange('hard')}
        />
      </div>
    </div>
  );
}

// Helper component for difficulty buttons
function DifficultyButton({ label, value, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex-1 py-1 px-1 text-xs rounded-md transition-colors",
        "border focus:outline-none focus:ring-1",
        isActive
          ? "bg-brandGray-700 text-white border-brandGreen-600 focus:ring-brandGreen-500"
          : "bg-brandGray-800 text-brandGray-400 border-brandGray-700 hover:bg-brandGray-750 focus:ring-brandGray-600"
      )}
    >
      {label}
    </button>
  );
}
