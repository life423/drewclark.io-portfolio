import React from 'react';
import Connect4Game from './Connect4Game.new';

/**
 * Test component to verify the new Connect 4 implementation works
 */
export default function TestNewImplementation() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold text-white mb-4">
        Connect Four - New Implementation
      </h2>
      <Connect4Game />
    </div>
  );
}
