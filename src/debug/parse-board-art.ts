import Snake from "@/classes/Snake"
import { Point } from "@/types"
import drawBoard from "./draw-board";
import { DIRECTION_TOKEN_MAP_LETTER } from '../utils/constants';
import { moves } from "@/utils/constants";
import applyMoveToPoint from "@/utils/apply-move-to-point";
import isPointOnBoard from "@/utils/is-point-on-board";
import getMoveFromPoints from "@/utils/get-move-from-points";

const HEAD_TOKENS = ['A', 'B', 'C', 'D', 'E']
export interface ParsedBoard {
  player: Snake,
  enemies: Snake[],
  food: Point[],
  width: number,
  height: number
}

function parseBoardArt(art: string) {
  const rows = art.split('\n')
  rows.shift();
  rows.pop();
  rows.reverse();

  const grid = rows.map(row => row.split(''))

  const food: Point[] = [];
  let player: Snake;
  const enemies: Snake[] = [];
  const snakeOutlines: { token: string, body: Point[] }[] = [];
  const width = grid[0].length ;
  const height = grid.length;

  const tokenGroups: { token: string, upper: Point, lower: Point[] }[] = []

  grid.forEach((row, y) => {
    row.forEach((token, x) => {
      if (token === '@') {
        food.push({ x, y });
      } else if (HEAD_TOKENS.includes(token)) {
        const snakeOutline = { token, body: [{ x, y }] }

        snakeOutlines.push(snakeOutline)
      }
    })
  })

  snakeOutlines.forEach(snakeOutline => {

    let startingLength: number;

    do {
      startingLength = snakeOutline.body.length

      moves
        .map(move => applyMoveToPoint(snakeOutline.body[snakeOutline.body.length - 1], move))
        .filter((point: Point) => isPointOnBoard(point, height, width))
        .forEach(point => {
          const neededMove = getMoveFromPoints(point, snakeOutline.body[snakeOutline.body.length - 1]);
          if (grid[point.y][point.x] === DIRECTION_TOKEN_MAP_LETTER[neededMove]) {
            snakeOutline.body.push(point)
          }
        })

    } while (snakeOutline.body.length !== startingLength)


    const snake = new Snake({
      id: `${snakeOutline.token}`,
      name: `${snakeOutline.token}`,
      health: 80,
      body: snakeOutline.body,
      head: snakeOutline.body[0],
      length: snakeOutline.body.length,
      shout: ''
    }, height, width);

    if (snakeOutline.token === 'A') {
      player = snake
    } else {
      enemies.push(snake)
    }
  })

  return {
    player,
    enemies,
    food,
    height,
    width
  }
}

export default parseBoardArt
