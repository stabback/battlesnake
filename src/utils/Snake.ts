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

  constructor(data: SnakeData) {
    Object.assign(this, data)
  }

  /**
   * Determines if the snake is currently intersecting the provided point
   */
  intersectsPoint(point: Point): boolean {
    return this.body.some(bodyPoint => isSamePoint(bodyPoint, point))
  }

  /**
   * Determines if a snake for sure will guaranteed be intersecting the provided point next turn.
   * Important - the snake may still intersect this point even if this returns false, such as if the
   * tail is growing due to eating or the head moving to the position.
   */
  willIntersectPoint(point: Point): boolean {
    const futureBody = this.body.slice(0, this.body.length - 1);
    return futureBody.some(bodyPoint => isSamePoint(bodyPoint, point))
  }

  /**
   * Determines if a snake may intersect the provided point.
   */
  mayIntersectPoint(point: Point): boolean {
    return [...this.body, ...this.possibleNextHeadPositions].some(bodyPoint => isSamePoint(bodyPoint, point))
  }

  get possibleNextHeadPositions(): Point[] {
    return moves
      .map(move => applyMove(this.head, move))
      .filter(updatedHead => {
        return !this.intersectsPoint(updatedHead)
      })
  }
}

export default Snake;