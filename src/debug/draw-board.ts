import chalk from 'chalk'

import Snake from "@/classes/Snake";
import { Point } from "@/types";

const ENEMY_STYLES = [
  { token: 'b', color: chalk.blue },
  { token: 'c', color: chalk.green },
  { token: 'd', color: chalk.cyan },
  { token: 'e', color: chalk.yellow }
]

function drawBoard(width: number, height: number, player: Snake, enemies: Snake[], food: Point[]) {
  const lines = []

  // Initial dashes
  lines.push(Array(width).fill('-').join(''));

  lines.push(`a: ${player.health}`)
  enemies.forEach((enemy, index) => lines.push(`${ENEMY_STYLES[index].token}: ${enemy.health}`))

  lines.push(Array(width).fill('-').join(''));

  // Setup the grid
  const grid = Array.from(Array(height), () => Array(width).fill('.'))

  // Fill in food
  food.forEach(item => grid[item.y][item.x] = chalk.red('@'))

  // Fill in the player
  drawSnake(grid, player, 'a', chalk.magenta)

  // Fill in enemies
  enemies.forEach((snake, index) => drawSnake(grid, snake, ENEMY_STYLES[index].token, ENEMY_STYLES[index].color))

  // Inverse for looks
  grid.reverse();

  // Join it together
  grid.forEach(row => lines.push(row.join('')))

  // Final dashes
  lines.push(Array(width).fill('-').join(''));

  // Print it out
  lines.forEach(line => console.log(line))
}

function drawSnake(board: string[][], snake: Snake, token: string, colorFunc: (input: string) => string) {
  snake.body.forEach(segment => board[segment.y][segment.x] = colorFunc(token))
  board[snake.head.y][snake.head.x] = colorFunc(token.toUpperCase())
}

export default drawBoard