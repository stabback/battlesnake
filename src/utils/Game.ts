import Board from "./Board"
import Snake from "./Snake"
import applyMove from './apply-move';

/**
 * Class which tracks the current state of the game.  Should not include snake
 * smart logic.
 */
class Game {
  public id: string
  public timeout: number
  public turn: number
  public board: Board
  public player: Snake

  constructor(state: GameState) {
    this.turn = state.turn;
    this.id = state.game.id;
    this.timeout = state.game.timeout;
    this.board = new Board(state.board, state.you.id)
    this.player = new Snake(state.you, this.board.height, this.board.width)
  }

  // Determines if a move will result in player death.  Does not look into the
  // future (to check for head collisions)
  isMoveSafe(move: Move): boolean {
    const updatedHead = applyMove(this.player.head, move)

    // Make sure the point is in the board
    if (!this.board.isPointOnBoard(updatedHead)) {
      return false;
    }

    // Make sure the point is not currently occupied
    if (!this.board.isPointSafe(updatedHead, this.player.id)) {
      return false;
    }

    return true;
  }

  isMoveMaybeSafe(move: Move): boolean {
    const point = applyMove(this.player.head, move)

    // Make sure the point is in the board
    if (!this.board.isPointOnBoard(point)) {
      return false;
    }

    // Make sure the point is not currently occupied
    return !this.board.snakes.some(snake => snake.intersects(point, false, false))
  }
}

export default Game