import chalk from 'chalk'

import Snake from "@/classes/Snake";
import { Point, Move } from "@/types";
import getMoveFromPoints from '@/utils/get-move-from-points';
import { DIRECTION_TOKEN_MAP_SYMBOL } from '@/utils/constants';

const ENEMY_STYLES = [
  { headToken: 'B', color: chalk.blue },
  { headToken: 'C', color: chalk.green },
  { headToken: 'D', color: chalk.cyan },
  { headToken: 'E', color: chalk.yellow }
]

function drawBoard(width: number, height: number, player: Snake, enemies: Snake[], food: Point[]): string[] {
  const lines = []

  // Initial dashes
  lines.push(Array(width).fill('-').join(''));

  const healthBar = [];
  if (player) {
    healthBar.push(chalk.magenta(`A: ${player.health}`))
  } else {
    healthBar.push(`A: DEAD!`)
  }

  enemies.forEach((enemy, index) => healthBar.push(ENEMY_STYLES[index].color(`${ENEMY_STYLES[index].headToken}: ${enemy.health}`)))

  lines.push(healthBar.join(' | '))

  lines.push(Array(width).fill('-').join(''));

  // Setup the grid
  const grid = Array.from(Array(height), () => Array(width).fill('.'))

  // Fill in the player
  if (player) {
    drawSnake(grid, player, 'A', chalk.magenta)
  }

  // Fill in enemies
  enemies.forEach((snake, index) => drawSnake(grid, snake, ENEMY_STYLES[index].headToken, ENEMY_STYLES[index].color))

  // Fill in food
  food.forEach(item => grid[item.y][item.x] = chalk.red('@'))

  // Inverse for looks
  grid.reverse();

  // Join it together
  grid.forEach(row => lines.push(row.join('')))

  // Final dashes
  lines.push(Array(width).fill('-').join(''));

  // Print it out
  return lines;
}


function drawSnake(board: string[][], snake: Snake, headToken: string, colorFunc: (input: string) => string) {
  try {
    let prevSegment: Point = null;

    snake.body.forEach(segment => {
      if (prevSegment) {
        const direction = getMoveFromPoints(segment, prevSegment);

        board[segment.y][segment.x] = colorFunc(DIRECTION_TOKEN_MAP_SYMBOL[direction])
      }

      prevSegment = segment;
    })
    board[snake.head.y][snake.head.x] = colorFunc(headToken.toUpperCase())
  } catch (e) {
    throw new Error('Attempting to draw a snake which has parts that are not on the board!')
  }

}

export default drawBoard
