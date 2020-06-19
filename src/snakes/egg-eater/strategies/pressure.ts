import pathfinder, { DiagonalMovement } from 'pathfinding'

import { Move, Point } from '@/types'
import Pathfinder from '@/utils/find-path'
import Scenario from '../classes/Scenario'
import getMoveFromPoints from '@/utils/get-move-from-points'

function pressure(scenario: Scenario): Move | null {
    // Find a path to every food on the board
    const paths = scenario.enemies
        .reduce((acc, snake): Point[] => {
            return [...acc, ...snake.possibleNextHeadPositions]
        }, [])
        .map((point: Point) => {
            const thisGrid = scenario.calculatedValues.grid.clone()
            return Pathfinder.find(scenario.player.head, point, thisGrid)
        })
        .sort((a, b) => {
            return a.length - b.length
        })

    if (!paths || paths.length === 0) {
        return null
    }

    const selectedPath = paths[0]

    const nextPoint = selectedPath[1]

    if (!nextPoint) {
        return null
    }

    const [nextX, nextY] = nextPoint

    return getMoveFromPoints(scenario.player.head, { x: nextX, y: nextY })
}

export default pressure
