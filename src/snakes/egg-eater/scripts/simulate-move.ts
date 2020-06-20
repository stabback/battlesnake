import parseBoardArt from '../../../debug/parse-board-art'
import { GameState } from '../../../types'
import Game from '../classes/Game'
import drawBoard from '../../../debug/draw-board'
const art = `
rrrrB......
u....Al....
ul..@.u....
.u....u....
.ul...ul...
rru....u..d
ul.....u.dl
.......u.d.
.......u.d.
.......ull.
...........
`

async function main() {
    const { player, enemies, food, height, width } = parseBoardArt(art)

    console.log('Simulating')
    const lines = drawBoard(width, height, player, enemies, food)
    lines.forEach(line => console.log(line))

    const gameState: GameState = {
        game: {
            id: 'foo',
            timeout: 2000
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

    game.end()
}

main()
