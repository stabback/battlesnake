import { Request, Response } from "express"
import Scenario from "../classes/Scenario"
import Snake from "@/classes/Snake"
import riskProfiles from "../constants/risk-profiles";
import getMoveFromPoints from "@/utils/get-move-from-points";
import { MoveResponse, GameState, Move } from "@/types";

const MAX_EXECUTION_TIME = 100;

function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const startTime = new Date().getTime();

  const game = request.body
  const player = new Snake(game.you, game.board.width, game.board.height);
  const enemies = game.board.snakes.filter(snake => snake.id !== player.id).map(snake => new Snake(snake, game.board.width, game.board.height));

  const rootScenario = new Scenario(
    game.board.width,
    game.board.height,
    player,
    enemies,
    game.board.food,
    riskProfiles.normal,
    { killBonus: false, ate: [], age: 0 }
  )

  rootScenario.createChildren();

  let resolvedMove: Move;

  // If no moves are possible, bail
  if (rootScenario.children.length === 0) {
    console.log("No valid moves!  Ahh!")
    resolvedMove = 'up'

  // If there is only one move possible, just do it
  } else if (rootScenario.children.length === 1) {
    console.log("Only one valid move, not predicting anything")
    resolvedMove = getMoveFromPoints(game.you.head, rootScenario.children[0].player.head)

  // Explore all possible scenarios and go for the best one
  } else {
    let queue: Scenario[] = [rootScenario];
    let createdScenarios = 1;

    do {
      const scenario = queue.shift();

      scenario.createChildren();

      if (scenario.children && scenario.children.length > 0) {
        queue = [...queue, ...scenario.children].filter(s => s)
      }

      createdScenarios = createdScenarios + 1;

    } while( queue.length > 0 && (new Date().getTime() - startTime) < MAX_EXECUTION_TIME )

    console.log("Explored", createdScenarios, "scenarios");

    // Score each scenario and determine its move
    const scenarios = rootScenario.children
      .filter(scenario => scenario.player)
      .map(scenario => {
        return {
          move: getMoveFromPoints(game.you.head, scenario.player.head),
          outcome: scenario.outcome
        }
      })

    console.log("SCENARIOS", scenarios)

    if (scenarios.length === 0) {
      console.log("We don't survive any of the scenarios, returning up")
      resolvedMove = 'up'
    } else {
      const moves = scenarios
      .reduce((acc, scenario) => {
        return {
          ...acc,
          [scenario.move]: [...acc[scenario.move], scenario.outcome]
        }
      }, { up: [], down: [], left: [], right: [] })

      const sortedMoves = Object.entries(moves)
        .filter(([m, outcomes]) => outcomes && outcomes.length > 0)
        .map(([m, outcomes]: [Move, number[]]) => {
          const averageOutcome = outcomes.reduce((acc, outcome) => outcome + acc, 0) / outcomes.length
          return { move: m, outcome: averageOutcome }
        }).sort((a, b) => b.outcome - a.outcome)

      resolvedMove = sortedMoves[0].move

      console.log("Moves", sortedMoves)
    }
  }


  console.log('MOVE:', game.turn + 1, resolvedMove, new Date().getTime() - startTime + 'ms')
  response.status(200).send({
    move: resolvedMove
  })
}

export default move
