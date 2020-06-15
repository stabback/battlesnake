import chalk from 'chalk'

import Snake from "@/classes/Snake";
import { Point } from "@/types";

const ENEMY_STYLES = [
  { token: 'b', color: chalk.blue },
  { token: 'c', color: chalk.green },
  { token: 'd', color: chalk.cyan },
  { token: 'e', color: chalk.yellow }
]

function drawBoard(width: number, height: number, player: Snake, enemies: Snake[], food: Point[]): string[] {
  const lines = []

  // Initial dashes
  lines.push(Array(width).fill('-').join(''));

  const healthBar = [];
  if (player) {
    healthBar.push(chalk.magenta(`a: ${player.health}`))
  } else {
    healthBar.push(`a: DEAD!`)
  }

  enemies.forEach((enemy, index) => healthBar.push(ENEMY_STYLES[index].color(`${ENEMY_STYLES[index].token}: ${enemy.health}`)))

  lines.push(healthBar.join(' | '))

  lines.push(Array(width).fill('-').join(''));

  // Setup the grid
  const grid = Array.from(Array(height), () => Array(width).fill('.'))

  // Fill in the player
  if (player) {
    drawSnake(grid, player, 'a', chalk.magenta)
  }

  // Fill in enemies
  enemies.forEach((snake, index) => drawSnake(grid, snake, ENEMY_STYLES[index].token, ENEMY_STYLES[index].color))

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

function drawSnake(board: string[][], snake: Snake, token: string, colorFunc: (input: string) => string) {
  try {
    snake.body.forEach(segment => {
      board[segment.y][segment.x] = colorFunc(token)
    })
    board[snake.head.y][snake.head.x] = colorFunc(token.toUpperCase())
  } catch (e) {
    throw new Error('Attempting to draw a snake which has parts that are not on the board!')
  }

}

export default drawBoard