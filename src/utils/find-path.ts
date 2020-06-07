import pathfinder, { Grid, DiagonalMovement } from 'pathfinding';

function findPath(from: Point, to: Point, grid: Grid) {
  let thisGrid;
  if (grid) {
    thisGrid = grid.clone();
  } else {
    thisGrid = 'foo'
  }
}