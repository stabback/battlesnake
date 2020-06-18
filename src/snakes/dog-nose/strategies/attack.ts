import pathfinder, { DiagonalMovement } from 'pathfinding'

import Game from '@/snakes/asp/classes/Game'
import { Move, Point } from '@/types'

function attack(game: Game): Move | null {
    // Attack pattern CLUB - identify all of the enemy snakes possible moves.  Pathfind to the nearest.
    const grid = new pathfinder.Grid(game.board.width, game.board.height)

    game.board.points.forEach(point => {
        grid.setWalkableAt(point.x, point.y, point.safe)
    })

    grid.setWalkableAt(game.player.head.x, game.player.head.y, true)

    const finder = new pathfinder.AStarFinder({
        diagonalMovement: DiagonalMovement.Never
    })

    // Find a path to every food on the board
    const paths = game.board.enemySnakes
        .reduce((acc, snake): Point[] => {
            return [...acc, ...snake.possibleNextHeadPositions]
        }, [])
        .map((point: Point) => {
            const thisGrid = grid.clone()
            return finder.findPath(
                game.player.head.x,
                game.player.head.y,
                point.x,
                point.y,
                thisGrid
            )
        })
        .filter(path => path && path.length)

    if (!paths || paths.length === 0) {
        return null
    }

    const sortedPaths = paths.sort((a, b) => {
        return a.length - b.length
    })

    const selectedPath = sortedPaths[0]

    const nextPoint = selectedPath[1]

    if (!nextPoint) {
        return null
    }

    const [nextX, nextY] = nextPoint

    if (nextX > game.player.head.x) {
        return 'right'
    }

    if (nextX < game.player.head.x) {
        return 'left'
    }

    if (nextY < game.player.head.y) {
        return 'down'
    }

    if (nextY > game.player.head.y) {
        return 'up'
    }
}

export default attack
