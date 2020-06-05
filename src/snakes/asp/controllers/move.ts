import { Request, Response } from "express"
import Game from "@/utils/Game"
import shuffle from 'fast-shuffle'
import { moves } from "@/utils/constants"
import strategies from '@/snakes/asp/strategies';
import logger from "@/logger/Logger"


function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const gameState = request.body

  logger.startTurn(gameState)

  const game = new Game(gameState)


  let resolvedMove: Move;

  logger.log(game, `[Move] Trying the eat strategy`)

  resolvedMove = strategies.eat(game)

  logger.log(game, `[Move] Eat strategy returned ${resolvedMove || 'null'}`)

  if (!resolvedMove) {
    logger.log(game, `[Move] Trying the random strategy`)
    resolvedMove = strategies.random(game)
    logger.log(game, `[Move] The random strategy returned ${resolvedMove}`)

  }

  logger.endTurn(gameState, resolvedMove)

  response.status(200).send({
    move: resolvedMove
  })
}

export default move
