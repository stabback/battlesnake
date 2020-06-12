import Scenario from "../snakes/bushmaster/classes/Scenario";
import Snake from "../classes/Snake";
import riskProfiles from "../snakes/bushmaster/constants/risk-profiles";


/**
 * ..h.
 * ..xx
 * .h..
 * .yyy
 */

const height = 4
const width = 4



const food = [{x: 1, y: 3}]

const player = new Snake({
  id: 'PLAYER',
  name: 'PLAYER',
  health: 70,
  body: [{ x: 2, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
  head: { x: 2, y: 3 },
  length: 3,
  shout: 'no'
}, height, width)

const enemy = new Snake({
  id: 'ENEMY',
  name: 'ENEMY',
  health: 70,
  body: [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  head: { x: 1, y: 1 },
  length: 4,
  shout: 'no'
}, height, width)



const scenario = new Scenario(
  width,
  height,
  player,
  [enemy],
  food,
  riskProfiles.normal,
  {killBonus: false, ate: [], age: 2}
);


scenario.createChildren();



scenario.children.forEach(child => {
  console.log(child.score, child.player.head, child.snakes[1].head)
})




