import React from 'react';
import clsx from 'clsx';
import Connect4Column from './Connect4Column.new';
import { ROWS, COLS } from './connect4Logic.new';

/**
 * Renders the Connect 4 game board
 * Manages layout and dispatches interactions to columns
 */
export default function Connect4Board({
  board,
  onColumnClick,
  isActive = true,
  lastMove = null,
  winningSequences = []
}) {
  return (
    <div className="w-full max-w-[300px] mx-auto">
      {/* Board frame with shadow effect */}
      <div 
        className={clsx(
          "connect4-board relative bg-brandGray-800 rounded-lg overflow-hidden",
          "border-2 border-brandGray-700",
          "shadow-lg shadow-brandGray-900/30", // Outer shadow
          isActive 
            ? "border-b-brandGreen-700/70" 
            : "border-b-brandGray-700/70",
          "pb-[6%]" // Bottom padding for 3D appearance
        )}
      >
        {/* Inner board area with grid pattern */}
        <div 
          className={clsx(
            "relative grid grid-cols-7 gap-0.5 p-1.5", // 7 columns for Connect 4
            "bg-gradient-to-b from-brandGray-750 to-brandGray-800", // Subtle gradient
            "rounded-md border border-brandGray-600"
          )}
        >
          {/* Render columns */}
          {Array(COLS).fill().map((_, colIndex) => {
            // Extract data for this column
            const columnData = board.map(row => row[colIndex]);
            
            return (
              <Connect4Column
                key={`column-${colIndex}`}
                columnIndex={colIndex}
                columnData={columnData}
                isActive={isActive}
                onClick={onColumnClick}
                lastMove={lastMove}
                winningSequences={winningSequences}
              />
            );
          })}
            
          {/* Optional winning highlight overlay */}
          {winningSequences && winningSequences.length > 0 && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-brandGreen-500/10 to-brandGreen-500/5 animate-glow-gentle pointer-events-none"
              style={{ animationDuration: '1.5s' }}
            />
          )}
        </div>
        
        {/* Bottom edge for 3D appearance */}
        <div 
          className={clsx(
            "absolute bottom-0 left-0 right-0 h-[4%]",
            "bg-gradient-to-r from-brandGray-900 via-brandGray-800 to-brandGray-900",
            "transform-gpu rotate-180"
          )}
        />
      </div>
      
      {/* Column labels (optional) */}
      <div className="flex justify-around mt-1">
        {Array(COLS).fill().map((_, i) => (
          <div 
            key={`label-${i}`} 
            className="w-6 h-6 flex items-center justify-center"
          >
            <span className="text-xs text-brandGray-500">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
