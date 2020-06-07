import { Request, Response } from "express"
import Game from "@/snakes/asp/classes/Game"
import strategies from '@/snakes/asp/strategies';
import logger from "@/logger/Logger"


function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const gameState = request.body

  logger.startTurn(gameState)

  const game = new Game(gameState)


  let resolvedMove: Move;

  logger.log(game, `[Move] Determining which strategy to use`)

  if (!resolvedMove) {
    logger.log(game, `[Move] Trying the attack strategy`)
    const biggestEnemy = game.board.enemySnakes.sort((a, b) => b.body.length - a.body.length)[0];
    logger.log(game, {
      message: `[Move] Biggest enemy is ${biggestEnemy.name} ${biggestEnemy.body.length}`,
      points: [{
        ...biggestEnemy.head,
        color: 'hotpink'
      }]
    })

    if (game.player.body.length >= (biggestEnemy.body.length + 2)) {
      logger.log(game, '[Move] We are bigger, attack!')
      resolvedMove = strategies.attack(game)
      logger.log(game, '[Move] Attack strategy resolved to ' + resolvedMove)
    } else {
      logger.log(game, '[Move] Size threshold not met, do not attack')
    }
  }


  if (!resolvedMove) {
    logger.log(game, `[Move] Trying the eat strategy`)

    resolvedMove = strategies.eat(game)

    logger.log(game, `[Move] Eat strategy returned ${resolvedMove || 'null'}`)
  }


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
