import { Request, Response } from "express"
import Game from "../../../utils/Game"
import shuffle from 'fast-shuffle'
import { moves } from "../../../utils/constants"
import strategies from '../strategies';


function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const gameState = request.body

  const game = new Game(gameState)

  
  let move: Move;
  
  let selectedStrategy = 'eat';
  move = strategies.eat(game)

  if (!move) {
    let selectedStrategy = 'random';
    move = strategies.random(game)  
  }

  console.log('MOVE', move, selectedStrategy)
  response.status(200).send({
    move: move
  })
}

export default move
