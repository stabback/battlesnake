import { Point } from "@/types";

function isPointOnBoard(point: Point, height: number, width: number) {
  if (point.x < 0 || point.y < 0) return false;

  if (point.x > (width - 1)) return false;
  if (point.y > (height - 1)) return false;

  return true;
}

export default isPointOnBoard