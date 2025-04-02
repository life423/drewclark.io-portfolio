// Export Connect4 components from original implementation
// To ensure consistency until full migration is complete

import Connect4Game from './Connect4Game';
import Connect4Board from './Connect4Board';
import Connect4Column from './Connect4Column';
import Connect4Controls from './Connect4Controls';
import { useConnect4Game } from './useConnect4Game';
import { useConnect4AI } from './useConnect4AI';
import * as connect4Logic from './connect4Logic';

export {
  Connect4Game,
  Connect4Board,
  Connect4Column,
  Connect4Controls,
  useConnect4Game,
  useConnect4AI,
  connect4Logic
};

export default Connect4Game;
