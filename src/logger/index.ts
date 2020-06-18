import express, { Request } from 'express'
import logger from './Logger'

const router = express.Router()

router.get('/', async (req, res) => {
    res.render('logger/list', {
        games: logger.games
    })
})

router.get('/:gameId', async (req: Request<{ gameId: string }>, res) => {
    const game = logger.getGameLog(req.params.gameId)

    if (!game) {
        res.status(404).send('Log does not exist')
    }

    res.render('logger/game-log', {
        game
    })
})

router.get(
    '/:gameId/:turnNumber',
    async (req: Request<{ gameId: string; turnNumber: string }>, res) => {
        const log = logger.getTurnLog(
            req.params.gameId,
            parseInt(req.params.turnNumber, 10)
        )

        if (!log) {
            res.status(404).send('Log does not exist')
        }

        res.render('logger/turn-log', {
            log
        })
    }
)

export default router
