import React, { useState } from 'react';
import clsx from 'clsx';
import Connect4Cell from './Connect4Cell.new';
import { ROWS, isValidMove } from './connect4Logic.new';

/**
 * Renders a single column of the Connect 4 board
 * Handles user interaction for dropping discs
 */
export default function Connect4Column({
  columnIndex,
  columnData = [],
  isActive = false,
  onClick,
  lastMove = null,
  winningSequences = []
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if this column can accept another disc
  const isColumnFull = !columnData.includes(null);
  const isColumnClickable = isActive && !isColumnFull;
  
  // Handle column click
  const handleClick = () => {
    if (isColumnClickable && onClick) {
      onClick(columnIndex);
    }
  };
  
  // Check if a cell in this column is part of the winning sequence
  const isWinningCell = (rowIndex, colIndex) => {
    if (!winningSequences || winningSequences.length === 0) return false;
    
    // Check all winning sequences
    return winningSequences.some(sequence => 
      sequence.some(([row, col]) => row === rowIndex && col === colIndex)
    );
  };
  
  // Check if a cell is the most recently played disc
  const isNewestCell = (rowIndex, colIndex) => {
    if (!lastMove) return false;
    return lastMove.row === rowIndex && lastMove.column === colIndex;
  };

  return (
    <div 
      className={clsx(
        "connect4-column relative flex flex-col-reverse", // Column is vertically reversed to match board layout
        "h-full w-full",
        isColumnClickable && "cursor-pointer" // Show pointer cursor only when column is clickable
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={isColumnClickable ? "button" : "cell"}
      aria-disabled={!isColumnClickable}
    >
      {/* Column hover effect - only visible on active columns */}
      {isActive && isHovered && !isColumnFull && (
        <div 
          className={clsx(
            "absolute inset-0 z-0 bg-brandGreen-500/20 animate-column-hover",
            "pointer-events-none", // Avoid interfering with mouse events
            "border-t-2 border-brandGreen-500/30"
          )}
        />
      )}
      
      {/* Disc preview animation - visible when column is hovered */}
      {isActive && isHovered && !isColumnFull && (
        <div 
          className={clsx(
            "absolute top-0 left-0 right-0 z-0 overflow-hidden",
            "flex justify-center items-center"
          )}
          style={{ height: '40px' }} // Matches cell height
        >
          <div className="w-[85%] h-[85%] rounded-full bg-brandOrange-500/30 animate-pulse-subtle">
            <div className="absolute inset-0 flex justify-center items-center text-brandOrange-300 text-lg">
              ↓
            </div>
          </div>
        </div>
      )}
      
      {/* Render cells for this column */}
      {Array(ROWS).fill().map((_, rowIndex) => {
        // The data comes in as a flat array [bottom-to-top]
        // But we render top-to-bottom, so we need to reverse the index
        // The flex-col-reverse class also ensures the visual order is correct
        return (
          <div 
            key={`cell-${rowIndex}`} 
            className="aspect-square flex justify-center items-center p-0.5"
          >
            <Connect4Cell
              value={columnData[rowIndex]}
              row={rowIndex}
              col={columnIndex}
              isWinning={isWinningCell(rowIndex, columnIndex)}
              isNewest={isNewestCell(rowIndex, columnIndex)}
            />
          </div>
        );
      })}
    </div>
  );
}
