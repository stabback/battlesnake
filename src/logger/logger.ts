/* tslint:disable: no-console */
import { Datastore } from '@google-cloud/datastore'

const datastore = new Datastore();

import Game from '@/utils/Game';
interface PointLog extends Point {
  color: string
  message: string
}

interface TurnLogMessage {
  message: string
  points?: PointLog[]
}

interface TurnLog {
  state: GameState
  move?: Move
  messages: TurnLogMessage[]
  start: Date
  end?: Date

}

interface GameLog {
  id: string
  start: Date
  end?: Date
  startingState: GameState
  endingState?: GameState
  turns: TurnLog[]
}

class Logger {
  games: GameLog[] = []

  getGameLog(gameId: string): GameLog {
    return this.games.find(game => game.id === gameId)
  }

  getTurnLog(gameId: string, turn: number): TurnLog {
    const gameLog = this.getGameLog(gameId)
    if (!gameLog) return null;

    return gameLog.turns.find(t => t.state.turn === turn)
  }

  startGame(state: GameState) {
    console.log(state.game.id, "START")

    this.games.push({
      id: state.game.id,
      start: new Date(),
      startingState: state,
      turns: []
    })
  }

  endGame(state: GameState) {
    console.log(state.game.id, "END")

    const game = this.getGameLog(state.game.id);

    if (game) {
      game.end = new Date()
      game.endingState = state
    }

    this.save();
  }

  startTurn(state: GameState) {
    const game = this.getGameLog(state.game.id);
    game.turns.push({
      state,
      messages: [],
      start: new Date()
    })
  }

  endTurn(state: GameState, move: Move) {
    console.log(state.game.id, "MOVE", move)

    const game = this.getGameLog(state.game.id);
    const turnNumber = state.turn;
    const turnLog = game.turns.find(log => log.state.turn === turnNumber)

    turnLog.end = new Date();
    turnLog.move = move;
  }

  log(game: Game, log: TurnLogMessage | string) {
    const turnLog = this.getTurnLog(game.id, game.turn)

    let turnLogMessage = log;

    if (typeof log === 'string') {
      turnLogMessage = { message: log }
    }

    turnLog.messages.push(turnLogMessage as TurnLogMessage)
  }

  save() {
    const key = datastore.key(['game'])
    datastore.save({ key, data: { games: this.games } });
  }
}

const logger = new Logger()

export default logger