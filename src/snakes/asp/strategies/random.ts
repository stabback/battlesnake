import Game from '@/snakes/asp/classes/Game'
import shuffle from 'fast-shuffle'
import { moves } from '@/utils/constants'
import logger from '@/logger/Logger'
import { Move } from '@/types'

function random(game: Game) {
    logger.log(game, `[Random] Starting the random strategy`)

    const shuffledMoves = shuffle(moves)

    logger.log(game, `[Random] Trying moves in this order: ${shuffledMoves}`)

    let move = shuffledMoves.find((m: Move) => {
        // Make sure we're not running into anything known
        return game.isMoveSafe(m)
    })

    // Uh oh, we are probably dead
    if (!move) {
        logger.log(game, '[Random] No guaranteed safe random move!')

        move = shuffledMoves.find((m: Move) => {
            return game.isMoveMaybeSafe(m)
        })
    }

    logger.log(game, `[Random] Resolved to ${move || 'nothing!'}`)

    if (!move) {
        logger.log(
            game,
            `[Random] No safe spots at all!  We're gunna die!  ${
                shuffledMoves[0]
            }`
        )
        return shuffledMoves[0]
    }

    return move
}

export default random
