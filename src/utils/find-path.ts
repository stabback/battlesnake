import pathfinder, { Grid, DiagonalMovement } from 'pathfinding'
import { Point } from '@/types'

export { Grid } from 'pathfinding'
class PathfinderClass {
    private finder = new pathfinder.AStarFinder({
        diagonalMovement: DiagonalMovement.Never
    })

    find(from: Point, to: Point, grid: Grid) {
        grid.setWalkableAt(from.x, from.y, true)
        grid.setWalkableAt(to.x, to.y, true)
        const path = this.finder.findPath(from.x, from.y, to.x, to.y, grid)

        if (path && path.length) return path

        return []
    }

    createGrid(width: number, height: number) {
        return new Grid(width, height)
    }
}

const Pathfinder = new PathfinderClass()

export default Pathfinder
