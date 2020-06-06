// TODO Determine if a snake is growing and avoid the tail
// TODO Attack strategy
// TODO Survive strategy

import express from 'express'
import * as controllers from './controllers'

const router = express.Router()

router.get('/', controllers.info)
router.post('/start', controllers.start)
router.post('/move', controllers.move)
router.post('/end', controllers.end)

export default router
