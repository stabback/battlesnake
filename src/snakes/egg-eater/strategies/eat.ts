import { Move } from '@/types'
import Scenario from '../classes/Scenario'
import Pathfinder from '@/utils/find-path'
import getMoveFromPoints from '@/utils/get-move-from-points'

function eat(scenario: Scenario): Move | null {
    if (!scenario.food || scenario.food.length === 0) {
        return null
    }

    // Find a path to every food on the board
    const paths = scenario.food
        .map(food => {
            const thisGrid = scenario.calculatedValues.grid.clone()

            return Pathfinder.find(
                { x: scenario.player.head.x, y: scenario.player.head.y },
                { x: food.x, y: food.y },
                thisGrid
            )
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

export default eat
