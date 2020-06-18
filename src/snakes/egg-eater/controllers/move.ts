import { Request, Response } from "express"
import { MoveResponse, GameState, Move } from "@/types";
import Oracle from "../classes/Oracle";
import Scenario from "@/snakes/dog-nose/classes/Scenario";
import Snake from "@/classes/Snake";
import isSamePoint from "@/utils/is-same-point";
import strategies from "../strategies";
import AspGame from "@/snakes/asp/classes/Game";
import chalk from "chalk";
import Game from "../classes/Game";

const NETWORK_BUFFER = 250;

async function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  const startTime = new Date().getTime();

  initializeOracle(request.body)
  const oracleDone = new Promise(res => Oracle.notifyWhenDone(res));

  const gameState = request.body

  const game = new AspGame(gameState)

  let resolvedMove: Move;

  if (!resolvedMove) {
    const biggestEnemy = game.board.enemySnakes.sort((a, b) => b.body.length - a.body.length)[0];

    if (game.player.body.length >= (biggestEnemy.body.length + 2)) {
      resolvedMove = strategies.attack(game)
    }
  }

  if (!resolvedMove) {
    resolvedMove = strategies.eat(game)
  }

  if (!resolvedMove) {
    resolvedMove = strategies.random(game)
  }

  const maxTime = game.timeout - NETWORK_BUFFER

  await Promise.race([
    oracleDone,
    new Promise(res => setTimeout(res, maxTime - (new Date().getTime() - startTime)))
  ])

  const endTime = new Date().getTime()

  let oracleGame = Oracle.getGame(game.id);

  if (!oracleGame) {
    Oracle.addGame(new Game(gameState))
    oracleGame = Oracle.getGame(game.id)
    console.log(
      game.turn,
      chalk.bgWhite.black(resolvedMove),
      "Oracle does not have this game, recreating!"
    )
  }
  const odds = Oracle.getGame(game.id).scenario.moveOdds;
  const resolvedMoveOdds = odds?.find(o => o.move === resolvedMove)

  console.log(
    game.turn,
    chalk.bgWhite.black(resolvedMove),
    Oracle.isDone ? 'Oracle is done' : `Timeout reached, ${Oracle.workQueue.length} remaining, ${Oracle.workCount} done`,
    endTime - startTime + 'ms',
    odds
  );

  if (resolvedMoveOdds?.loseOdds > 0.3) {
    resolvedMove = Oracle.getGame(game.id)?.scenario?.safestMove;
    console.log("--", chalk.redBright("ORACLE INTERCEPTED"))
    console.log("-- SENDING", resolvedMove)
  }

  response.status(200).send({
    move: resolvedMove
  })
}

function initializeOracle(state: GameState) {

  const game = Oracle.getGame(state.game.id);

  if (!game) {
    console.error("ERROR - Can't find this game in oracle?")
    console.log("--", state.game.id)
    console.log("--", Oracle.runningGames)
    console.log("--", Oracle.games.map(g => g.id))

    return
  }

  const player = new Snake(state.you, game.width, game.height);

  const enemies = state.board.snakes
    .filter(snake => snake.id !== player.id)
    .map(snake => new Snake(snake, game.width, game.height))

  const ate = game.scenario.food
    .map(point => state.board.snakes.find(snake => snake.body.some(segment => isSamePoint(point, segment))))
    .filter(snake => snake)
    .map(snake => snake.id)

  const scenario = new Scenario(player, enemies, state.board.food, ate, game.id, game.width, game.height)

  Oracle.updateBaseScenario(scenario)
}

export default move
