import Game from "../../../utils/Game";
import { moves } from "../../../utils/constants";

import pathfinder, { DiagonalMovement } from 'pathfinding';

function eat(game: Game): Move | null {
  if (!game.board.food || game.board.food.length === 0) {
    return null;
  }

  // Setup the grid for the pathfinding library
  const grid = new pathfinder.Grid(game.board.width, game.board.height);

  game.board.snakes.forEach(snake => snake.body.forEach(point => {
    grid.setWalkableAt(point.x, point.y, false)
  }));
  
  grid.setWalkableAt(game.player.head.x, game.player.head.y, true);

  const finder = new pathfinder.AStarFinder({
    diagonalMovement: DiagonalMovement.Never
  });

  

  // Find a path to every food on the board
  const paths = game.board.food.map(food => {
    const thisGrid = grid.clone();

    return finder.findPath(game.player.head.x, game.player.head.y, food.x, food.y, thisGrid);
  })

  const sortedPaths = paths.sort((a, b) => {
    // ASC  -> a.length - b.length
    // DESC -> b.length - a.length
    return a.length - b.length;
  });
  
  const selectedPath = sortedPaths[0];

  const nextPoint = selectedPath[1];

  if (!nextPoint) {
    return null;
  }

  const [nextX, nextY] = nextPoint;

  if (nextX > game.player.head.x) {
    return 'right'
  }

  if (nextX < game.player.head.x) {
    return 'left'
  }

  if (nextY < game.player.head.y) {
    return 'down'
  }

  if (nextX < game.player.head.y) {
    return 'up'
  }


}

export default eat