import React, { useState, useEffect } from 'react';
import './Connect4.css';

const TestNewImplementation = () => {
  // Game board: 7 columns x 6 rows
  // null = empty, 1 = player 1, 2 = player 2
  const [board, setBoard] = useState(Array(7).fill().map(() => Array(6).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [droppingPiece, setDroppingPiece] = useState(null);
  
  // Handle column click
  const handleColumnClick = (columnIndex) => {
    // If a piece is currently dropping, ignore clicks
    if (droppingPiece) return;
    
    // Find the lowest empty cell in the column
    const column = board[columnIndex];
    const rowIndex = column.lastIndexOf(null);
    
    // If column is full, ignore click
    if (rowIndex === -1) return;
    
    // Set dropping animation
    setDroppingPiece({
      column: columnIndex,
      row: rowIndex,
      player: currentPlayer
    });
    
    // After animation, update board state
    const timeout = setTimeout(() => {
      const newBoard = [...board];
      newBoard[columnIndex][rowIndex] = currentPlayer;
      setBoard(newBoard);
      setDroppingPiece(null);
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }, 500); // 500ms for drop animation
    
    return () => clearTimeout(timeout);
  };

  return (
    <div className="connect4-game">
      <div className="connect4-board">
        {board.map((column, columnIndex) => (
          <div 
            key={columnIndex} 
            className="connect4-column"
            onClick={() => handleColumnClick(columnIndex)}
          >
            {column.map((cell, rowIndex) => (
              <div 
                key={rowIndex} 
                className={`connect4-cell ${cell === 1 ? 'player1' : cell === 2 ? 'player2' : ''}`}
              >
                {/* Cell content */}
              </div>
            ))}
            
            {/* Dropping piece animation */}
            {droppingPiece && droppingPiece.column === columnIndex && (
              <div 
                className={`connect4-piece dropping player${droppingPiece.player}`}
                style={{ 
                  top: `calc(${droppingPiece.row} * 50px)`,
                  animationDuration: '500ms'
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="connect4-status">
        <p>Player {currentPlayer}'s turn</p>
      </div>
    </div>
  );
};

export default TestNewImplementation;
