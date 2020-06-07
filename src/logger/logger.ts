/* tslint:disable: no-console */
import { Datastore } from '@google-cloud/datastore'

const datastore = new Datastore();

import Game from '@/snakes/asp/classes/Game';
interface PointLog extends Point {
  color: string
  message?: string
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

class LoggerClass {
  games: GameLog[] = []

  async restore() {
    console.log("Restoring logs...");
    // Read in any existing game logs
    const query = datastore
      .createQuery('gameLog')
      .order('start', {
        descending: true
      })
      .limit(10)

    const res = (await datastore.runQuery(query))[0]
    if (res) {
      this.games = res.map(log => log.game)
      console.log("Restored", this.games.length, 'logs')
    } else {
      console.warn("Did not restore any logs")
    }
  }

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

    this.games.unshift({
      id: state.game.id,
      start: new Date(),
      startingState: state,
      turns: []
    })

    this.games.pop();
  }

  endGame(state: GameState) {
    console.log(state.game.id, "END")

    const game = this.getGameLog(state.game.id);

    if (game) {
      game.end = new Date()
      game.endingState = state
    }

    this.saveGameLog(game);
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

  async saveGameLog(game: GameLog) {
    console.log("Saving the game log...")
    const key = datastore.key(['gameLog', game.id])
    const result = await datastore.save({ key, data: { game, start: game.start } });
    console.log("Saved!", result)
  }
}

const Logger = new LoggerClass()

export default Logger