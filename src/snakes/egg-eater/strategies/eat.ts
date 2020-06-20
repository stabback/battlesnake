import { Move } from '@/types'
import Scenario from '../classes/Scenario'
import Pathfinder from '@/utils/find-path'
import getMoveFromPoints from '@/utils/get-move-from-points'

function eat(scenario: Scenario): Move | null {
    if (!scenario.food || scenario.food.length === 0) {
        return null
    }

    // Find a path to every food on the board
    const pathToFood = scenario.food
        .map(food => {
            const thisGrid = scenario.calculatedValues.grid.clone()

            const p = Pathfinder.find(
                { x: scenario.player.head.x, y: scenario.player.head.y },
                { x: food.x, y: food.y },
                thisGrid
            )

            return p
        })
        .sort((a, b) => {
            return a.length - b.length
        })

    const canReturn = pathToFood.map(path => {
        if (!path || path.length === 0) {
            return false
        }

        const reversedPath = [...path].reverse().map(([x, y]) => ({
            x,
            y
        }))

        reversedPath.pop()

        const pathFoodToTail = [...reversedPath, ...scenario.player.body]
        const futureBody = pathFoodToTail.slice(0, scenario.player.length)
        const futureHead = futureBody[0]
        const futureTail = futureBody[futureBody.length - 1]

        const thisGrid = scenario.calculatedValues.grid.clone()

        scenario.player.body.forEach(segment =>
            thisGrid.setWalkableAt(segment.x, segment.y, true)
        )
        futureBody.forEach(segment =>
            thisGrid.setWalkableAt(segment.x, segment.y, false)
        )
        thisGrid.setWalkableAt(futureHead.x, futureHead.y, true)
        thisGrid.setWalkableAt(futureTail.x, futureTail.y, true)

        const returnPath = Pathfinder.find(futureHead, futureTail, thisGrid)

        return returnPath && returnPath.length > 0
    })

    const paths = pathToFood
        .map((p, index) => ({
            path: p,
            canReturn: canReturn[index]
        }))
        .filter(map => map.path && map.path.length)

    if (!paths || paths.length === 0) {
        return null
    }

    let selectedFood = paths.find(p => p.canReturn)

    if (
        // If there is no safe food, or the selected food is too far away
        (!selectedFood ||
            selectedFood.path.length > scenario.player.health - 8) &&
        // And the player is going to starve
        scenario.player.health < 20
    ) {
        // Select the closest even if it will kill us
        selectedFood = paths[0]
    }

    if (!selectedFood) {
        return null
    }

    const selectedPath = selectedFood.path

    const nextPoint = selectedPath[1]

    if (!nextPoint) {
        return null
    }

    const [nextX, nextY] = nextPoint

    return getMoveFromPoints(scenario.player.head, { x: nextX, y: nextY })
}

export default eat
