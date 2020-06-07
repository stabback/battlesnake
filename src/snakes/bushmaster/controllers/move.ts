import { Request, Response } from "express"
import Game from "@/snakes/asp/classes/Game"
import shuffle from 'fast-shuffle'
import { moves } from "@/utils/constants"
import strategies from '@/snakes/asp/strategies';
import logger from "@/logger/Logger"


function move(request: Request<{}, MoveResponse, GameState>, response: Response<MoveResponse>) {
  // const startRunTime = new Date().getTime();

  // const game = new Game(request.body);

  // const maxRunTime = 450;
  // let move;
  // const state: SimpleGameState = {
  //   food: game.board.food,
  //   snakes: game.board.snakes.map(({head, body, id}) => ({
  //     head, body, id
  //   }))
  // }

  // while (
  //   !move &&
  //   (new Date().getTime()) - startRunTime < maxRunTime
  // ) {

  // }

  // Get all possible moves
  // If only one move, return that move.
  // For every move
  // Get a list of all enemy moves
  // For every combination of moves
  // Recurse in.  Try 4 levels deep

  // For every combination of moves
  // Score the moves
  // Choose the best score
  // Return that value



  response.status(200).send({
    move: 'up'
  })
}

export default move

const riskProfiles: {
  [key: string]: RiskProfile
} = {
  neutral: {
    // Is applied if dead
    playerDead: -1000,

    // Multiplied against current player health
    playerHealth: 1,

    // Multiplied against each enemies health
    enemyHealth: -0.5,

    // Multiplied against the delta length between us and the biggest enemy snake (maxes positive at 2 times)
    relativeLength: 10,

    // Multiplied against the number of enemy snakes alive
    enemyCount: -20,

    // This number is divided by the number of spaces away a smaller snakes head is
    smallSnakeProximity: 50,

    // This number is divided by the number of spaces away a larger snakes head is
    dangerSnakeProximity: -50,

    // Bonus applied to eating a smaller snake head on
    killBonus: 200
  }
}

interface RiskProfile {
  playerDead: number,
  playerHealth: number,
  enemyHealth: number,
  relativeLength: number,
  enemyCount: number,
  smallSnakeProximity: number,
  dangerSnakeProximity: number,
  killBonus: number,
}

function scoreState(state: Game, profile: RiskProfile): number {

  const score: Partial<RiskProfile> = {
    playerDead: Boolean(state.player) ? 0 : profile.playerDead,
    playerHealth: profile.playerHealth * state.player.health,
    enemyHealth: state.board.enemySnakes.reduce((acc, snake) => snake.health + acc, 0) * profile.enemyHealth,
    enemyCount: state.board.enemySnakes.length * profile.enemyCount
  }

  const biggestEnemy = state.board.enemySnakes.sort((a, b) => b.body.length - a.body.length)[0];
  const relativeLength = state.player.body.length - biggestEnemy.body.length;
  const limitedRelativeLength = Math.min(relativeLength, 2)
  score.relativeLength = limitedRelativeLength * profile.relativeLength

  return Object.values(score).reduce((acc, i) => acc + i, 0);
}

interface PossibleFuture {
  game: Game,
  children: PossibleFuture[]
}