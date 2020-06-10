import Snake from "@/classes/Snake";
import Logger from '@/logger/Logger';
import isPointOnBoard from "@/utils/is-point-on-board";

interface DescribedPoint extends Point {
  safe: boolean
}
/**
 * Class used to help provide board specific information.  Helpers and derived information from
 * the board should live here.
 */
class Board {
  public height: number;
  public width: number;
  public food: Point[]
  public snakes: Snake[];
  public enemySnakes: Snake[];
  public points: DescribedPoint[];

  constructor(data: BoardData, youId: string) {
    this.height = data.height;
    this.width = data.width;
    this.food = data.food;
    this.snakes = data.snakes.map(snakeData => new Snake(snakeData, this.height, this.width))
    this.enemySnakes = this.snakes.filter(snake => snake.id !== youId)

    this.points = [];

    for (let i = 0; i < this.height * this.width; i++) {
      const point = {
        x: i % this.width,
        y: Math.floor(i / this.height)
      }

      const safe = this.isPointSafe(point, youId);

      this.points.push({
        ...point,
        safe
      })
    }
  }



  isPointOnBoard(point: Point): boolean {
    return isPointOnBoard(point, this.height, this.width)
  }

  isPointSafe(point: Point, youId: string): boolean {
    const you = this.snakes.find(snake => snake.id === youId);
    if (you.intersects(point,false,false)) return false;

    const smallerSnakes = this.enemySnakes.filter(snake => snake.body.length < you.body.length);
    if (smallerSnakes.some(snake => snake.intersects(point, true, false))) return false;

    const threatSnakes = this.enemySnakes.filter(snake => snake.body.length >= you.body.length);
    if (threatSnakes.some(snake => snake.intersects(point, true, true))) return false;

    return true;
  }
}

export default Board;