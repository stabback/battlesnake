import parseBoardArt from '../../../debug/parse-board-art'
import { GameState } from '../../../types'
import Game from '../classes/Game'
import drawBoard from '../../../debug/draw-board'
import Controller from '../classes/Controller'
/*
...........
...........
...........
...........
...........
...........
...........
...........
...........
...........
...........
 */

const art = `
...........
...........
.....Bll..
.......ul..
........ul.
.........u.
....d..rdu@
..@.rdruru.
.....rrrrrd
......dllll
...@..A.@.@
`

async function main() {
    const { player, enemies, food, height, width } = parseBoardArt(art)

    console.log('Simulating')
    const lines = drawBoard(width, height, player, enemies, food)
    lines.forEach(line => console.log(line))

    const gameState: GameState = {
        game: {
            id: 'foo',
            timeout: 5000
        },
        turn: 50,
        board: {
            height,
            width,
            food,
            snakes: [player, ...enemies].map(snake => snake.data)
        },
        you: {
            ...player.data
        }
    }

    const game = new Game(gameState)

    game.start()

    await game.move(gameState, new Date().getTime())

    console.log('Work queue is', Controller.simulator.workQueue.length)

    let min = 9999

    Controller.simulator.workQueue.forEach(item => {
        if (item.age < min) {
            min = item.age
        }
    })

    console.log('Minium left is ', min)

    game.end()
}

main()
