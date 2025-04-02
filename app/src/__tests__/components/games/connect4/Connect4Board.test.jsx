import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Connect4Board from '../../../../components/games/connect4/Connect4Board.new';
import { EMPTY, PLAYER, AI } from '../../../../components/games/connect4/connect4Logic.new';

// Mock props
const createMockProps = (overrides = {}) => ({
  board: Array(6).fill().map(() => Array(7).fill(EMPTY)),
  onColumnClick: jest.fn(),
  winningCells: [],
  lastMove: null,
  isActive: true,
  ...overrides
});

describe('Connect4Board Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with empty board', () => {
    const props = createMockProps();
    const { container } = render(<Connect4Board {...props} />);
    
    // Check that all columns are rendered
    const columns = container.querySelectorAll('.connect4-column');
    expect(columns).toHaveLength(7);
    
    // Check that each column has 6 cells
    columns.forEach(column => {
      const cells = column.querySelectorAll('.connect4-cell');
      expect(cells).toHaveLength(6);
    });
  });

  it('calls onColumnClick when a column is clicked', () => {
    const mockOnColumnClick = jest.fn();
    const props = createMockProps({ onColumnClick: mockOnColumnClick });
    
    const { container } = render(<Connect4Board {...props} />);
    
    // Find the first column and click it
    const firstColumn = container.querySelector('.connect4-column');
    fireEvent.click(firstColumn);
    
    // Check that onColumnClick was called with column index 0
    expect(mockOnColumnClick).toHaveBeenCalledWith(0);
  });

  it('does not call onColumnClick when isActive is false', () => {
    const mockOnColumnClick = jest.fn();
    const props = createMockProps({
      onColumnClick: mockOnColumnClick,
      isActive: false
    });
    
    const { container } = render(<Connect4Board {...props} />);
    
    // Find the first column and click it
    const firstColumn = container.querySelector('.connect4-column');
    fireEvent.click(firstColumn);
    
    // Check that onColumnClick was NOT called
    expect(mockOnColumnClick).not.toHaveBeenCalled();
  });

  it('renders player and AI discs correctly', () => {
    // Create a board with some moves
    const board = Array(6).fill().map(() => Array(7).fill(EMPTY));
    board[5][0] = PLAYER; // Bottom-left cell
    board[5][1] = AI;     // Bottom cell, second column
    
    const props = createMockProps({ board });
    render(<Connect4Board {...props} />);
    
    // Check that the player and AI discs are rendered with correct classes
    const playerCells = document.querySelectorAll('.cell-player');
    const aiCells = document.querySelectorAll('.cell-ai');
    
    expect(playerCells).toHaveLength(1);
    expect(aiCells).toHaveLength(1);
  });

  it('highlights winning cells correctly', () => {
    const winningCells = [[5, 0], [5, 1], [5, 2], [5, 3]]; // Bottom row, first 4 cells
    const props = createMockProps({ winningCells });
    
    const { container } = render(<Connect4Board {...props} />);
    
    // Check that winning cells are highlighted
    const highlightedCells = container.querySelectorAll('.cell-winning');
    expect(highlightedCells).toHaveLength(4);
  });

  it('shows the last move indicator', () => {
    const lastMove = { row: 5, column: 3 };
    const props = createMockProps({ lastMove });
    
    const { container } = render(<Connect4Board {...props} />);
    
    // Check that the last move indicator is shown
    const lastMoveCell = container.querySelector('.cell-last-move');
    expect(lastMoveCell).not.toBeNull();
  });
});
