import { Point, Move } from "@/types"

function getMoveFromPoints(current: Point, next: Point): Move {
  if (next.x > current.x) {
    return 'right'
  }

  if (next.x < current.x) {
    return 'left'
  }

  if (next.y < current.y) {
    return 'down'
  }

  if (next.y > current.y) {
    return 'up'
  }
}

export default getMoveFromPoints