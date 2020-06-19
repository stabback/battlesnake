import { Request, Response } from 'express'
import { GameState } from '@/types'
import Simulator from '../classes/Simulator'
import Game from '../classes/Game'

function start(
    request: Request<{}, string, GameState>,
    response: Response<string>
) {
    const state = request.body

    const game = new Game(state)

    if (!game) {
        response.status(500).send('Could not create this game')
        return
    }

    game.start()

    console.log('')
    console.log('=================')
    console.log('[Start]', game.id)
    console.log('=================')
    console.log('')
    response.status(200).send('ok')
}

export default start
