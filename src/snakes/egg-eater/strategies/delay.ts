import { Move } from '@/types'
import Scenario from '../classes/Scenario'
import Pathfinder from '@/utils/find-path'
import getMoveFromPoints from '@/utils/get-move-from-points'

// Chase our tail
function delay(scenario: Scenario): Move | null {
    const thisGrid = scenario.calculatedValues.grid.clone()
    const selectedPath = Pathfinder.find(
        scenario.player.head,
        scenario.player.body[scenario.player.body.length - 1],
        thisGrid
    )

    const nextPoint = selectedPath[1]

    if (!nextPoint) {
        return null
    }

    const [nextX, nextY] = nextPoint

    return getMoveFromPoints(scenario.player.head, { x: nextX, y: nextY })
}

export default delay
