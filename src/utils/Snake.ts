import { moves } from "./constants";
import applyMove from './apply-move';

class Snake implements SnakeData {
  public id: string;
  public name: string;
  public health: number;
  public body: Point[];
  public head: Point;
  public length: number;
  public shout: string;

  constructor(data: SnakeData) {
    Object.assign(this, data)
  }

  intersectsPoint(point: Point): boolean {
    return this.body.some(bodyPoint => bodyPoint.x === point.x && bodyPoint.y === point.y)
  }

  possibleMoves(): Point[] {
    return moves
      .map(move => applyMove(this.head, move))
      .filter(updatedHead => {
        return !this.body.includes(updatedHead)
      })
  }
}

export default Snake;