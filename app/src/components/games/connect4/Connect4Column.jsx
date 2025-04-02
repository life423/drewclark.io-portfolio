import React, { useState } from 'react';
import clsx from 'clsx';
import Connect4Disc from './Connect4Disc';
import { ROWS, isValidMove } from './connect4Logic';

/**
 * Represents a single column of the Connect 4 board
 * Handles the user interaction for dropping discs
 */
export default function Connect4Column({
  columnIndex,
  columnState = [],
  isActive = false,
  onDiscDrop,
  lastMove = null,
  winningCells = []
}) {
  // Log column state for debugging
  console.log(`Rendering column ${columnIndex} with state:`, columnState);
  const [isHovered, setIsHovered] = useState(false);
  
  // Whether this column can accept another disc
  const isColumnAvailable = isActive && columnState.filter(cell => cell !== null).length < ROWS;
  console.log(`Column ${columnIndex} available:`, isColumnAvailable, `Active: ${isActive}, Filled cells: ${columnState.filter(cell => cell !== null).length}`);
  
  // Handlers for column interaction
  const handleClick = () => {
    console.log(`Column ${columnIndex} clicked, isColumnAvailable:`, isColumnAvailable);
    if (isColumnAvailable && onDiscDrop) {
      console.log(`Dropping disc in column ${columnIndex}`);
      onDiscDrop(columnIndex);
    }
  };
  
  // Check if a cell in this column is part of the winning pattern
  const isWinningCell = (rowIndex, colIndex) => {
    if (!winningCells) return false;
    return winningCells.some(([row, col]) => row === rowIndex && col === colIndex);
  };
  
  // Check if a cell is the most recently played disc
  const isNewestDisc = (rowIndex, colIndex) => {
    if (!lastMove) return false;
    return lastMove.row === rowIndex && lastMove.column === colIndex;
  };

  return (
    <div 
      className={clsx(
        "connect4-column relative flex flex-col-reverse",  // Column is vertically reversed to match board layout
        "h-full w-full",  // Take up equal space in grid
        isColumnAvailable && "cursor-pointer",  // Show cursor only when column is clickable
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={isColumnAvailable ? "button" : "cell"}
      aria-disabled={!isColumnAvailable}
    >
      {/* Column hover effect - only visible on active columns */}
      {isActive && isHovered && isColumnAvailable && (
        <div 
          className={clsx(
            "absolute inset-0 z-0 bg-brandGreen-500/10 animate-column-hover",
            "pointer-events-none" // Avoid interfering with mouse events
          )}
        />
      )}
      
      {/* Disc preview animation - visible when column is hovered */}
      {isActive && isHovered && isColumnAvailable && (
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
        // Explicitly check the value at this position
        const discValue = columnState[rowIndex];
        console.log(`Rendering disc at column ${columnIndex}, row ${rowIndex}, value:`, discValue);
        
        // Determine if this is the newest disc
        const isNewest = isNewestDisc(rowIndex, columnIndex);
        console.log(`Is newest disc at (${rowIndex},${columnIndex}):`, isNewest);
        
        return (
          <div 
            key={`cell-${rowIndex}`} 
            className="aspect-square flex justify-center items-center p-0.5"
          >
            <Connect4Disc
              player={discValue} // Will be null, 'player', or 'ai'
              row={rowIndex}
              col={columnIndex}
              isWinning={isWinningCell(rowIndex, columnIndex)}
              isNewest={isNewest}
            />
          </div>
        );
      })}
    </div>
  );
}
