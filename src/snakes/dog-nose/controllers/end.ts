import { Request, Response } from 'express'
import { GameState } from '@/types'
import Oracle from '../classes/Oracle'

function end(
    request: Request<{}, string, GameState>,
    response: Response<string>
) {
    const state = request.body

    Oracle.endGame(state.game.id)

    response.status(200).send('ok')
}

export default end
