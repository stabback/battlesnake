import express, { Response, Request } from 'express'
import logger from './logger'

const router = express.Router()

router.get('/', (req, res) => {
  console.log(logger)
  res.render('logger/list', { games: logger.games })
})

export default router