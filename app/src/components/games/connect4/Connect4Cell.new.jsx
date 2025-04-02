import React from 'react';
import clsx from 'clsx';
import { PLAYER, AI, EMPTY } from './connect4Logic.new';

/**
 * Renders a single cell in the Connect 4 board
 * This replaces the previous Connect4Disc component with cleaner implementation
 */
export default function Connect4Cell({
  value = EMPTY,
  row,
  col,
  isWinning = false,
  isNewest = false
}) {
  // Empty cells have lighter styling
  if (value === EMPTY) {
    return (
      <div className="connect4-cell w-full h-full p-1 relative z-10 flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-brandGray-700 border border-brandGray-600/70">
          {/* Empty slot inner shadow */}
          <div className="absolute inset-0 rounded-full opacity-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>
        </div>
      </div>
    );
  }
  
  // Determine player colors
  const discColor = value === PLAYER 
    ? 'bg-brandOrange-600' 
    : 'bg-brandGreen-500';
  
  const glowColor = value === PLAYER
    ? 'shadow-brandOrange-500/40'
    : 'shadow-brandGreen-400/40';
  
  const highlightColor = value === PLAYER
    ? 'bg-brandOrange-400'
    : 'bg-brandGreen-400';
    
  return (
    <div 
      className={clsx(
        "connect4-cell w-full h-full p-[3px] relative z-10",
        "flex items-center justify-center",
        // Drop in animation - different timing for each row
        isNewest && "animate-disc-drop",
        isWinning && "animate-pulse-gentle"
      )}
      style={{
        // Custom animation delay for cascading drop effect
        animationDelay: isNewest ? `${row * 0.1}s` : '0s',
      }}
    >
      <div 
        className={clsx(
          // Base disc styling
          "relative w-full h-full rounded-full", 
          discColor,
          // Glowing effect for winning discs
          isWinning && `shadow-lg ${glowColor}`
        )}
      >
        {/* Light reflection on top */}
        <div 
          className={clsx(
            "absolute inset-x-[20%] inset-y-[20%] top-[10%] left-[15%]",
            "rounded-full opacity-60",
            highlightColor,
            // Extra glow for winning discs
            isWinning && "opacity-80 animate-glow-gentle"
          )}
          style={{
            // Elliptical highlight shape
            width: '35%',
            height: '25%',
            // Slight rotation
            transform: 'rotate(-30deg)',
          }}
        ></div>
        
        {/* Inner shadow for 3D effect */}
        <div 
          className="absolute inset-0 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
        ></div>
      </div>
    </div>
  );
}
