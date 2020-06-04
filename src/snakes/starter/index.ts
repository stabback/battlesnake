// tslint:disable: no-console

import express, { Response, Request } from 'express'

const router = express.Router()

router.get('/', handleIndex)
router.post('/start', handleStart)
router.post('/move', handleMove)
router.post('/end', handleEnd)

function handleIndex(request: Request, response: Response) {
  const battlesnakeInfo = {
    apiversion: '1',
    author: '',
    color: '#888888',
    head: 'default',
    tail: 'default'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request: Request, response: Response) {
  const GameState = request.body

  console.log('START')
  response.status(200).send('ok')
}

function handleMove(request: Request, response: Response) {
  const GameState = request.body

  const possibleMoves = ['up', 'down', 'left', 'right']
  const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

  console.log('MOVE: ' + move)
  response.status(200).send({
    move
  })
}

function handleEnd(request: Request, response: Response) {
  const GameState = request.body

  console.log('END')
  response.status(200).send('ok')
}

export default router