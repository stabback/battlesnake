import Snake from "@/classes/Snake"
import { Point } from "@/types"
import drawBoard from "./draw-board";

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
  const width = grid[0].length ;
  const height = grid.length;

  const tokenGroups: { token: string, upper: Point, lower: Point[] }[] = []

  grid.forEach((row, y) => {
    row.forEach((token, x) => {
      switch (token) {
        case '@':
          food.push({ x, y });
          break;

        case '.':
          break;

        default:
          const lowerCase = token.toLowerCase();

          let tokenGroup = tokenGroups.find(group => group.token === lowerCase)

          if (!tokenGroup) {
            tokenGroup = {
              token: lowerCase,
              upper: null,
              lower: []
            }

            tokenGroups.push(tokenGroup)
          }

          if (tokenGroup.token === token) {
            tokenGroup.lower.push({x, y})
          } else {
            tokenGroup.upper = {x, y}
          }
          break;
      }
    })
  })

  tokenGroups.forEach(tokenGroup => {
    const snake = new Snake({
      id: `snake-${tokenGroup.token}`,
      name: `Snake ${tokenGroup.token}`,
      health: 80,
      body: [tokenGroup.upper, ...tokenGroup.lower],
      head: tokenGroup.upper,
      length: tokenGroup.lower.length + 1,
      shout: ''
    }, height, width);

    if (tokenGroup.token === 'a') {
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
