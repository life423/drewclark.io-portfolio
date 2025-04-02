/**
 * Connect 4 Game Logic
 * 
 * Core functions for managing game state, moves, and win detection.
 * This is a complete rewrite with simplified and consistent logic.
 */

// Game constants
export const ROWS = 6;
export const COLS = 7;
export const EMPTY = null;
export const PLAYER = 'player';
export const AI = 'ai';

/**
 * Creates a new empty board
 * Board representation:
 * - Row 0 = bottom row (where pieces land first due to gravity)
 * - Row 5 = top row
 * @returns {Array<Array<null>>} A 2D array representing the empty board
 */
export function createBoard() {
  return Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY));
}

/**
 * Checks if a move to the specified column is valid
 * @param {Array<Array<string|null>>} board - Current board state
 * @param {number} column - Column to check (0-6)
 * @returns {boolean} Whether the move is valid
 */
export function isValidMove(board, column) {
  // Check if column is in range
  if (column < 0 || column >= COLS) {
    return false;
  }
  
  // A move is valid if the top cell in the column is empty
  return board[ROWS - 1][column] === EMPTY;
}

/**
 * Gets all columns that are available for moves
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
 * Places a disc in the specified column
 * The disc will "drop" to the lowest available position in the column
 * @param {Array<Array<string|null>>} board - Current board state
 * @param {number} column - Column to place disc in (0-6)
 * @param {string} player - Player identifier (PLAYER or AI)
 * @returns {Object} Object containing new board state and placement info
 */
export function dropDisc(board, column, player) {
  // Create a deep copy of the board
  const newBoard = board.map(row => [...row]);
  
  // Find the lowest empty row in the column (starting from the bottom)
  for (let row = 0; row < ROWS; row++) {
    if (newBoard[row][column] === EMPTY) {
      // Place the disc
      newBoard[row][column] = player;
      return { 
        board: newBoard, 
        row, 
        column,
        player 
      };
    }
  }
  
  // If we get here, the column is full (should never happen if isValidMove was checked)
  return { 
    board: newBoard, 
    row: -1, 
    column,
    player 
  };
}

/**
 * Checks if a position is part of a winning sequence
 * @param {Array<Array<[number, number]>>} winningSequences - Arrays of winning positions
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @returns {boolean} Whether the position is part of a winning sequence
 */
export function isWinningPosition(winningSequences, row, col) {
  if (!winningSequences) return false;
  
  return winningSequences.some(sequence => 
    sequence.some(([r, c]) => r === row && c === col)
  );
}

/**
 * Checks if the board has a winning pattern
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {Object} Object containing winner and winning sequences
 */
export function checkWin(board) {
  const winningSequences = [];
  
  // Check horizontal wins
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY && 
          cell === board[row][col + 1] && 
          cell === board[row][col + 2] && 
          cell === board[row][col + 3]) {
        
        winningSequences.push([
          [row, col], 
          [row, col + 1], 
          [row, col + 2], 
          [row, col + 3]
        ]);
      }
    }
  }
  
  // Check vertical wins
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY && 
          cell === board[row + 1][col] && 
          cell === board[row + 2][col] && 
          cell === board[row + 3][col]) {
        
        winningSequences.push([
          [row, col], 
          [row + 1, col], 
          [row + 2, col], 
          [row + 3, col]
        ]);
      }
    }
  }
  
  // Check diagonal wins (rising: /)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY && 
          cell === board[row - 1][col + 1] && 
          cell === board[row - 2][col + 2] && 
          cell === board[row - 3][col + 3]) {
        
        winningSequences.push([
          [row, col], 
          [row - 1, col + 1], 
          [row - 2, col + 2], 
          [row - 3, col + 3]
        ]);
      }
    }
  }
  
  // Check diagonal wins (falling: \)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const cell = board[row][col];
      if (cell !== EMPTY && 
          cell === board[row + 1][col + 1] && 
          cell === board[row + 2][col + 2] && 
          cell === board[row + 3][col + 3]) {
        
        winningSequences.push([
          [row, col], 
          [row + 1, col + 1], 
          [row + 2, col + 2], 
          [row + 3, col + 3]
        ]);
      }
    }
  }
  
  // If we have winning sequences, determine the winner
  if (winningSequences.length > 0) {
    const [row, col] = winningSequences[0][0];
    return {
      winner: board[row][col],
      winningSequences
    };
  }
  
  return {
    winner: null,
    winningSequences: []
  };
}

/**
 * Checks if the board is full (a draw)
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {boolean} Whether the board is full
 */
export function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY));
}

/**
 * Gets the current game status
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {Object} Game status information
 */
export function getGameStatus(board) {
  const { winner, winningSequences } = checkWin(board);
  
  if (winner) {
    return {
      status: 'win',
      winner,
      winningSequences
    };
  }
  
  if (isBoardFull(board)) {
    return {
      status: 'draw',
      winner: null,
      winningSequences: []
    };
  }
  
  return {
    status: 'playing',
    winner: null,
    winningSequences: []
  };
}

/**
 * Creates a string representation of the board for debugging
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {string} String representation of the board
 */
export function boardToString(board) {
  // Create a copy and reverse it for prettier display (bottom row at the bottom)
  const displayBoard = [...board].reverse();
  
  return displayBoard.map(row => 
    row.map(cell => 
      cell === EMPTY ? '⚪' : 
      cell === PLAYER ? '🔴' : '🟡'
    ).join(' ')
  ).join('\n');
}

/**
 * Gets a random valid move
 * Useful for fallback when AI fails
 * @param {Array<Array<string|null>>} board - Current board state
 * @returns {number} Column index for the move
 */
export function getRandomMove(board) {
  const availableColumns = getAvailableColumns(board);
  if (availableColumns.length === 0) return -1;
  
  return availableColumns[Math.floor(Math.random() * availableColumns.length)];
}

/**
 * Basic AI strategy for Connect 4
 * 1. Win if possible
 * 2. Block opponent from winning
 * 3. Prefer center column
 * 4. Random valid move
 * 
 * @param {Array<Array<string|null>>} board - Current board state
 * @param {string} aiPlayer - AI player identifier
 * @param {string} humanPlayer - Human player identifier
 * @returns {number} Column index for the best move
 */
export function findBestMove(board, aiPlayer, humanPlayer) {
  const availableColumns = getAvailableColumns(board);
  if (availableColumns.length === 0) return -1;
  
  // 1. Check if AI can win in one move
  for (const col of availableColumns) {
    const { board: newBoard } = dropDisc(board, col, aiPlayer);
    const { winner } = checkWin(newBoard);
    if (winner === aiPlayer) {
      return col;
    }
  }
  
  // 2. Check if opponent can win in one move and block
  for (const col of availableColumns) {
    const { board: newBoard } = dropDisc(board, col, humanPlayer);
    const { winner } = checkWin(newBoard);
    if (winner === humanPlayer) {
      return col;
    }
  }
  
  // 3. Prefer center column if available
  const centerColumn = 3;
  if (availableColumns.includes(centerColumn)) {
    return centerColumn;
  }
  
  // 4. Choose a random valid move
  return getRandomMove(board);
}
