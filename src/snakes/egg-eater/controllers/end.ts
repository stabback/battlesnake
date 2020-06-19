import { Request, Response } from 'express'
import { GameState } from '@/types'
import Simulator from '../classes/Simulator'
import Controller from '../classes/Controller'

function end(
    request: Request<{}, string, GameState>,
    response: Response<string>
) {
    const state = request.body

    const game = Controller.getGame(state.game.id)

    if (!game) {
        response.status(500).send('game not registered')
        return
    }

    game.end()
    response.status(200).send('ok')
}

export default end
