import React, { useMemo } from 'react';
import clsx from 'clsx';
import Connect4Column from './Connect4Column';
import { ROWS, COLS } from './connect4Logic';

/**
 * Main game board component
 * Renders the 7x6 Connect 4 grid with columns
 */
export default function Connect4Board({
  board,
  onColumnClick,
  winningCells = null,
  lastMove = null,
  droppingPiece = null,
  isActive = true
}) {
  // Transform the board data for easier column-based rendering
  // Our connect4Logic stores data in row-major order, but we render in columns
  const columnData = useMemo(() => {
    // Log the original board for debugging
    console.log("Original board:", JSON.stringify(board));
    
    const columns = [];
    
    for (let col = 0; col < COLS; col++) {
      // Create array with all cells explicitly set to null initially
      const columnCells = Array(ROWS).fill(null);
      
      for (let row = 0; row < ROWS; row++) {
        // Always set the value, whether null or a player value
        columnCells[row] = board[row][col];
      }
      
      columns.push(columnCells);
      console.log(`Column ${col} data:`, columnCells);
    }
    
    return columns;
  }, [board]);

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
            "bg-gradient-to-b from-brandGray-800 to-brandGray-850", // Subtle gradient
            "rounded-md"
          )}
        >
          {/* Column components */}
          {columnData.map((columnCells, colIndex) => (
            <Connect4Column
              key={`column-${colIndex}`}
              columnIndex={colIndex}
              columnState={columnCells}
              isActive={isActive}
              onDiscDrop={onColumnClick}
              lastMove={lastMove}
              winningCells={winningCells}
              droppingPiece={droppingPiece && droppingPiece.column === colIndex ? droppingPiece : null}
            />
          ))}
            
          {/* Optional winning highlight overlay */}
          {winningCells && (
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
