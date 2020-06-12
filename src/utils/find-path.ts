import pathfinder, { Grid, DiagonalMovement } from 'pathfinding';
import { Point } from '@/types';

export { Grid } from 'pathfinding'
class PathfinderClass {
  private finder = new pathfinder.AStarFinder({
    diagonalMovement: DiagonalMovement.Never
  })

  find(from: Point, to: Point, grid: Grid) {
    const paths = this.finder.findPath(from.x, from.y, to.x, to.y, grid).filter(path => path && path.length)

    if (paths.length) return paths[0]

    return []
  }

  createGrid(width: number, height: number) {
    return new Grid(width, height)
  }
}

const Pathfinder = new PathfinderClass()

export default Pathfinder;