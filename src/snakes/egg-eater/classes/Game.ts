import Scenario from "./Scenario"
import { GameState, Move } from '@/types';
import Snake from "./Snake";

const DEFAULT_NETWORK_LATENCY = 250;

class Game {

  /** Current scenario - represents the current state of the game */
  public scenario: Scenario

  /** ID of the game as determined by battlesnakes */
  public id: string

  /** Time before battlesnakes ignores our response */
  public timeout: number

  /** Width of the board */
  public width: number

  /** Height of the board */
  public height: number

  /** Describes the move we sent to battlesnakes last */
  public previousMove: Move;

  /** Represents the amount of time we should allocate to network latency */
  public latency = DEFAULT_NETWORK_LATENCY;

  /** The maximum amount of time we should let pass before we send back a response on a move request */
  public get maxResponseTime() {
    return this.timeout - this.latency
  }

  constructor(
    state: GameState
  ) {
    // Store the base attributes that should be consistent for the life of the game
    this.id = state.game.id;
    this.timeout = state.game.timeout;
    this.width = state.board.width
    this.height = state.board.height

    // Create the initial scenario representing game state
    const player = new Snake(state.you, this.width, this.height)
    const enemies = state.board.snakes
      .filter(snake => snake.id !== player.id)
      .map(snake => new Snake(snake, this.width, this.height))

    this.scenario = new Scenario(player, enemies, state.board.food, [], this.id, this.width, this.height);
    this.scenario.createChildren();
  }

  public end(): void {
    return
  }
}

export default Game