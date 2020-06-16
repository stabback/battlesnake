import parseBoardArt from '@/debug/parse-board-art';
import readline from 'readline'

import Game from '../classes/Game';
import Controller from '../classes/Controller';
import drawBoard from '@/debug/draw-board';
import chalk from 'chalk';

/**
 * Initial setup stuff
 */
const { width, height, player, enemies, food } = parseBoardArt(`
d..........
rdBlllll...
.A....@....
...........
..@........
...........
...........
.........@.
...........
...........
...........
`)

const playerData = {
  id: player.id,
  name: player.name,
  health: player.health,
  body: player.body,
  head: player.head,
  length: player.length,
  shout: player.shout
}

const enemyData = enemies.map(enemy => ({
  id: enemy.id,
  name: enemy.name,
  health: enemy.health,
  body: enemy.body,
  head: enemy.head,
  length: enemy.length,
  shout: enemy.shout
}))

Controller.addGame(new Game({
  game: {
    id: 'foo',
    timeout: 500
  },
  turn: 0,
  board: {
    height, width, food, snakes: [playerData, ...enemyData]
  },
  you: playerData
}))

const game = Controller.getGame('foo')

/**
 * UI loop /simulator
 */
const run = true;
const speed = 0;
const tick = 0;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const uiInterval = setInterval(() => printStatus(), 1000/30)
const currentScenarioArt = drawBoard(game.width, game.height, game.scenario.player, game.scenario.enemies, game.scenario.food)

function printStatus() {
  process.stdout.cursorTo(0, 0)
  process.stdout.clearScreenDown()
  process.stdout.write('Game is running\n')
  process.stdout.write('ctrl-c to exit\n')
  process.stdout.write('====================\n')

  process.stdout.write('\n')
  process.stdout.write('Statistics\n')
  process.stdout.write(`Tick is ${tick}\n`)
  process.stdout.write(`Work queue is ${Controller.workQueue.length} long\n`)
  process.stdout.write(`Total work units done: ${Controller.workCount}\n`)
  process.stdout.write(`Average time per work unit: ${Controller.workCount / Controller.totalWorkTime}ms\n`)

  process.stdout.write('\n')
  process.stdout.write('Current scenario\n')
  currentScenarioArt.forEach(line => process.stdout.write(line + '\n'))
  process.stdout.write(`Outcome right now is ${JSON.stringify(game.scenario.outcome)}\n`)
  process.stdout.write(`Odds are ${JSON.stringify(game.scenario.moveOdds)}\n`)
  process.stdout.write(`Best move is ${chalk.bold(game.scenario.bestMove)}\n`)

}