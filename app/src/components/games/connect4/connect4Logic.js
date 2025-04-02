/**
 * Connect 4 Game Logic
 * Core functions for managing game state, moves, and win detection
 */

// Constants
export const ROWS = 6;
export const COLS = 7;
export const EMPTY = null;
export const PLAYER = 'player';
export const AI = 'ai';

/**
 * Creates a new empty board
 * @returns {Array<Array<null>>} A 2D array representing the board state
 */
export function createEmptyBoard() {
  return Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY));
}

/**
 * Determines if a column has available space
 * @param {Array<Array<string|null>>} board - Current board state
 * @param {number} col - Column to check
 * @returns {boolean} Whether the column can accept another disc
 */
export function isValidMove(board, col) {
  // Column is invalid if out of bounds
  if (col < 0 || col >= COLS) {
    console.log(`Column ${col} is out of bounds`);
    return false;
  }
  
  // Column is valid if the top cell is empty (row 0 is the top in our representation)
  const isValid = board[0][col] === EMPTY;
  console.log(`Column ${col} validity check: ${isValid ? 'valid' : 'invalid'}`);
  return isValid;
}

/**
 * Gets all columns that are currently available for moves
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {Array<number>} Array of valid column indices
 */
export function getAvailableColumns(board) {
  const columns = [];
  for (let col = 0; col < COLS; col++) {
    if (isValidMove(board, col)) {
      columns.push(col);
    }
  }
  return columns;
}

/**
 * Place a disc in the specified column
 * @param {Array<Array<string|null>>} board - Current board state
 * @param {number} col - Column to place disc in
 * @param {string} player - Player identifier (PLAYER or AI)
 * @returns {{board: Array<Array<string|null>>, row: number}} New board state and row where disc was placed
 */
export function dropDisc(board, col, player) {
  // Create a deep copy of the board to avoid mutation
  const newBoard = board.map(row => [...row]);
  
  // Log initial state for debugging
  console.log(`Dropping disc in column ${col} for player ${player}`);
  console.log("Current board state:", boardToString(board));
  
  // Find the lowest empty row in the column (starting from the bottom)
  // Connect 4 pieces drop to the lowest available slot
  let row = ROWS - 1;
  while (row >= 0 && newBoard[row][col] !== EMPTY) {
    row--;
  }
  
  // If we found an empty cell, place the disc
  if (row >= 0) {
    console.log(`Placing disc at row ${row}, column ${col}`);
    newBoard[row][col] = player;
    
    // Log the new board state
    console.log("New board state:", boardToString(newBoard));
    
    return { board: newBoard, row: row };
  }
  
  // Return original board if move is invalid
  console.log(`Column ${col} is full, move invalid`);
  return { board, row: -1 };
}

/**
 * Check if the board has a winning pattern
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {{winner: string|null, cells: Array<[number, number]>|null}} Winner and winning cells if any, null otherwise
 */
export function checkWin(board) {
  // Check horizontally
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY &&
          cell === board[row][col + 1] &&
          cell === board[row][col + 2] &&
          cell === board[row][col + 3]) {
        return {
          winner: cell,
          cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
        };
      }
    }
  }
  
  // Check vertically
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY &&
          cell === board[row + 1][col] &&
          cell === board[row + 2][col] &&
          cell === board[row + 3][col]) {
        return {
          winner: cell,
          cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
        };
      }
    }
  }
  
  // Check diagonally (/)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY &&
          cell === board[row - 1][col + 1] &&
          cell === board[row - 2][col + 2] &&
          cell === board[row - 3][col + 3]) {
        return {
          winner: cell,
          cells: [[row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]]
        };
      }
    }
  }
  
  // Check diagonally (\)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY &&
          cell === board[row + 1][col + 1] &&
          cell === board[row + 2][col + 2] &&
          cell === board[row + 3][col + 3]) {
        return {
          winner: cell,
          cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
        };
      }
    }
  }
  
  // No winner found
  return { winner: null, cells: null };
}

/**
 * Check if the board is completely filled (a draw)
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {boolean} True if the board is full (draw)
 */
export function checkDraw(board) {
  // Game is a draw if all cells are filled
  return board.every(row => row.every(cell => cell !== EMPTY));
}

/**
 * Get game status from board state
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {{status: string, winner: string|null, winningCells: Array<[number, number]>|null}} Status object
 */
export function getGameStatus(board) {
  const { winner, cells } = checkWin(board);
  
  if (winner) {
    return {
      status: 'win',
      winner,
      winningCells: cells
    };
  }
  
  if (checkDraw(board)) {
    return {
      status: 'draw',
      winner: null,
      winningCells: null
    };
  }
  
  return {
    status: 'playing',
    winner: null,
    winningCells: null
  };
}

/**
 * Create a string representation of the board for debugging
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {string} String representation of the board
 */
export function boardToString(board) {
  return board.map(row => 
    row.map(cell => cell === EMPTY ? '⚪' : cell === PLAYER ? '🔴' : '🟡').join('')
  ).join('\n');
}
