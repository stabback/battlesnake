import Snake from "./Snake";
import Logger from '@/logger/Logger';

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
    this.snakes = data.snakes.map(snakeData => new Snake(snakeData))
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
    if (point.x < 0 || point.y < 0) return false;

    if (point.x > (this.width - 1)) return false;
    if (point.y > (this.height - 1)) return false;

    return true;
  }

  isPointOccupied(point: Point): boolean {
    return this.snakes.some(snake => snake.intersectsPoint(point))
  }

  isPointSafe(point: Point, youId: string): boolean {
    const you = this.snakes.find(snake => snake.id === youId);
    if (you.willIntersectPoint(point)) return false;

    const smallerSnakes = this.enemySnakes.filter(snake => snake.body.length < you.body.length);
    if (smallerSnakes.some(snake => snake.willIntersectPoint(point))) return false;

    const threatSnakes = this.enemySnakes.filter(snake => snake.body.length >= you.body.length);
    if (threatSnakes.some(snake => snake.mayIntersectPoint(point))) return false;

    return true;
  }
}

export default Board;