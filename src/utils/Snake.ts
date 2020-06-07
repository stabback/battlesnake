import { moves } from "./constants";
import applyMove from './apply-move';
import isSamePoint from "./is-same-point";

class Snake implements SnakeData {
  public id: string;
  public name: string;
  public health: number;
  public body: Point[];
  public head: Point;
  public length: number;
  public shout: string;

  constructor(data: SnakeData, private height: number, private width: number) {
    Object.assign(this, data)
  }

  intersects(point: Point, includeTail = true, includePossibleMoves = true): boolean {
    const segments = [];

    segments.push(...this.body.slice(0, this.body.length - 1))

    if (includeTail) {
      segments.push(this.body[this.body.length - 1])
    }

    if (includePossibleMoves) {
      segments.push(...this.possibleNextHeadPositions)
    }

    return segments.some(segment => isSamePoint(segment, point))

  }

  get possibleNextHeadPositions(): Point[] {
    return moves
      .map(move => applyMove(this.head, move))
      .filter(updatedHead => {
        return (
          updatedHead.x >= 0 &&
          updatedHead.y >= 0 &&
          updatedHead.x < this.width &&
          updatedHead.y < this.height
        )
      })
      .filter(updatedHead => {
        return !this.body.some(segment => isSamePoint(segment, updatedHead))
      })
  }
}

export default Snake;
