import Scenario from '../snakes/bushmaster/classes/Scenario'
import Snake from '../classes/Snake'
import riskProfiles from '../snakes/bushmaster/constants/risk-profiles'
import parseBoardArt from './parse-board-art'
import drawBoard from './draw-board'

const { width, height, player, enemies, food } = parseBoardArt(`
a.bbb
aBb..
A....
.....
.Cccc
`)

const scenario = new Scenario(
    width,
    height,
    player,
    enemies,
    food,
    riskProfiles.normal,
    { killBonus: false, ate: [], age: 2 }
)

// console.log("Root Scenario");
// const rootLines = drawBoard(width, height, scenario.player, scenario.snakes.filter(snake => snake.id !== 'a'), scenario.food)
// rootLines.forEach(line => console.log(line))

console.time('Root scenario child creation')
for (let i = 0; i <= 1; i++) {
    scenario.children = []
    scenario.createChildren()
}

console.timeEnd('Root scenario child creation')
