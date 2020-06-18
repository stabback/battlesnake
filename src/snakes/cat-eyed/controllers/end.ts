import { Request, Response } from 'express'
import { GameState } from '@/types'
import Controller from '../classes/Controller'

function end(
    request: Request<{}, string, GameState>,
    response: Response<string>
) {
    const state = request.body

    Controller.endGame(state.game.id)

    response.status(200).send('ok')
}

export default end
