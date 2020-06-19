import { Request, Response } from 'express'
import { MoveResponse, GameState, Move } from '@/types'
import Game from '../classes/Game'
import Controller from '../classes/Controller'

const NETWORK_BUFFER = 250

async function move(
    request: Request<{}, MoveResponse, GameState>,
    response: Response<MoveResponse>
) {
    const startTime = new Date().getTime()

    const state = request.body

    let game = Controller.getGame(state.game.id)

    if (!game) {
        console.error(
            'ERROR - Attempting to move with a game that does not exist',
            state.game.id
        )
        game = new Game(state)

        game.start()
    }

    const resolvedMove = await game.move(state, startTime)

    response.status(200).send({
        move: resolvedMove
    })
}

export default move
