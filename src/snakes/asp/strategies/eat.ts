import pathfinder, { DiagonalMovement } from 'pathfinding';


import logger from "@/logger/Logger";
import Game from '@/utils/Game';


function eat(game: Game): Move | null {
  logger.log(game, '[Eat] Strategy start')

  if (!game.board.food || game.board.food.length === 0) {
    logger.log(game, '[Eat] There is no food on the board, exiting')
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
  }).filter(path => path)

  if (!paths || paths.length === 0) {
    logger.log(game, `Could not find any paths to any food`)
    return null;
  }

  const sortedPaths = paths.sort((a, b) => {
    // ASC  -> a.length - b.length
    // DESC -> b.length - a.length
    return a.length - b.length;
  });

  logger.log(game, `[Eat] Found ${paths.length} paths: ${JSON.stringify(paths)}`)

  const selectedPath = sortedPaths[0];

  const nextPoint = selectedPath[1];

  logger.log(game, {
    message: '[Eat] Selected path',
    points: selectedPath.map(pathItem => ({
      x: pathItem[0],
      y: pathItem[1],
      color: 'red',
      message: 'Selected path'
    }))
  })

  if (!nextPoint) {
    logger.log(game, 'Next point is null?  Exiting')
    return null;
  }

  const [nextX, nextY] = nextPoint;

  logger.log(game, {
    message: '[Eat] Next point to move to',
    points: [{ x: nextX, y: nextY, color: 'blue', message: 'Next point' }]
  })

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