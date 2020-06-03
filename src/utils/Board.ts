import Snake from "./Snake";

/**
 * Class used to help provide board specific information.  Helpers and derived information from
 * the board should live here.
 */
class Board {
  public height: number;
  public width: number;
  public food: Point[]
  public snakes: Snake[];

  constructor(data: BoardData) {
    this.height = data.height;
    this.width = data.width;
    this.food = data.food;
    this.snakes = data.snakes.map(snakeData => new Snake(snakeData))
  }

  isPointOnBoard(point: Point): boolean {
    if (point.x < 0 || point.y < 0) return false;

    if (point.x > (this.width - 1)) return false;
    if (point.y > (this.height - 1)) return false;

    return true;
  }

  isPointOccupied(point: Point): boolean {
    return this.snakes.some(snake => snake.intersectsPoint(point))
  }
}

export default Board;