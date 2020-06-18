import Scenario from "./Scenario"
import { GameState } from '@/types';
import Snake from "@/classes/Snake";

class Game {
  public scenario: Scenario

  public id: string
  public timeout: number
  public width: number
  public height: number

  public workQueue: Scenario[] = [];

  constructor(
    state: GameState
  ) {
    this.id = state.game.id;
    this.timeout = state.game.timeout;
    this.width = state.board.width
    this.height = state.board.height

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