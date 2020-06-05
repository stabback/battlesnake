import express, { Request } from 'express'
import logger from './Logger'

const router = express.Router()

router.get('/', async (req, res) => {

  const games = logger.games.map(game => ({
    id: game.id,
    start: game.start,
    won: game.endingState.board.snakes[0].id === game.endingState.you.id
  }))

  res.render('logger/list', {
    games
  })

})

router.get('/:gameId', async (req: Request<{gameId: string}>, res) => {
  const game = logger.getGameLog(req.params.gameId)

  if (!game) {
    res.status(404).send('Log does not exist')
  }

  res.render('logger/log', {
    game
  })
})

export default router