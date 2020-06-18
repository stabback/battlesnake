import Game from '@/snakes/asp/classes/Game'
import shuffle from 'fast-shuffle'
import { moves } from '@/utils/constants'
import { Move } from '@/types'

function random(game: Game) {
    const shuffledMoves = shuffle(moves)

    let move = shuffledMoves.find((m: Move) => {
        // Make sure we're not running into anything known
        return game.isMoveSafe(m)
    })

    // Uh oh, we are probably dead
    if (!move) {
        move = shuffledMoves.find((m: Move) => {
            return game.isMoveMaybeSafe(m)
        })
    }

    if (!move) {
        return shuffledMoves[0]
    }

    return move
}

export default random
