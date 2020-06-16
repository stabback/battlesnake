import { Request, Response } from "express"
import { MoveResponse, GameState, Move } from "@/types";
import Controller from "../classes/Controller";
import Scenario from "@/snakes/cat-eyed/classes/Scenario";
import Snake from "@/classes/Snake";
import isSamePoint from "@/utils/is-same-point";

const MAX_EXECUTION_TIME = 250;

function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const startTime = new Date().getTime();

  const state = request.body

  const game = Controller.getGame(state.game.id);


  const player = new Snake(state.you, game.width, game.height);

  const enemies = state.board.snakes
    .filter(snake => snake.id !== player.id)
    .map(snake => new Snake(snake, game.width, game.height))

  const ate = game.scenario.food
    .map(point => state.board.snakes.find(snake => snake.body.some(segment => isSamePoint(point, segment))))
    .filter(snake => snake)
    .map(snake => snake.id)

  const scenario = new Scenario(player, enemies, state.board.food, ate, game.id, game.width, game.height)

  Controller.updateBaseScenario(scenario)

  setTimeout(() => {
    console.log("MOVE:", game.scenario.bestMove, "Death odds:", Math.round(game.scenario.moveOdds[0].odds * 10000) / 100 + "%")
    response.status(200).send({
      move: game.scenario.bestMove
    })
  }, MAX_EXECUTION_TIME - (new Date().getTime() - startTime))



}

export default move
