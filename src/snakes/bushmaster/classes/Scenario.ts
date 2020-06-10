import Snake from "@/classes/Snake";

import { RiskProfile } from "../constants/risk-profiles";
import fastCartesian from 'fast-cartesian';
import Pathfinder, { Grid } from "@/utils/find-path";
import isSamePoint from "@/utils/is-same-point";
import isPointOnBoard from "@/utils/is-point-on-board";
import { AssertionError } from "assert";

interface ScenarioHistory {
  killBonus: boolean,

  /** Array of IDs of snakes that ate last turn, and will be growing this turn */
  ate: string[],

  age?: number
}

class Scenario {

  /**
   * The score for this specific scenario, not taking into account future scenarios
   */
  public score: number;

  /**
   * Scenarios that are possible from this scenario
   */
  public children: Scenario[]

  /**
   * A representation of the board for this scenario
   */
  private grid: Grid

  /**
   * Determines if this scenario is an endgame scenario.
   */
  get isEnd() {
    return !this.player || this.enemies.length === 0
  }

  /**
   * An array of all snakes for easy iteration
   */
  get snakes() {
    return [this.player, ...this.enemies]
  }

  /**
   * An overall outcome for this scenario including all child outcomes.
   */
  public get outcome(): number {
    if (!this.children || this.children.length === 0) {
      return this.score ;
    }
    const childOutcome = this.children.reduce((acc, child) => {
      console.assert(!isNaN(child.outcome), 'Outcome for child is not a number', this, child)
      return acc + child.outcome
    }, 0) / this.children.length

    return (this.score + childOutcome) / 2
  }

  constructor(
    private width: number,
    private height: number,
    public player: Snake,
    private enemies: Snake[],
    private food: Point[],
    private profile: RiskProfile,
    private history: ScenarioHistory
  ) {
    if (player && enemies.length > 0) {
      this.setupPathfinding();
    }
    this.calculateScore();
  }

  private setupPathfinding() {
    this.grid = Pathfinder.createGrid(this.width, this.height)

    this.snakes.forEach(snake => {
      snake.body.forEach(segment => {
        this.grid.setWalkableAt(segment.x, segment.y, false)
      })
    })

    this.grid.setWalkableAt(this.player.head.x, this.player.head.y, true);
  }


  /**
   * Determines this particular scenarios individual score according to the provided risk profile
   */
  private calculateScore() {
    let score = 0;

    if (!this.player || this.player.length === 0) {
      this.score = this.profile.playerDead.impact
      return;
    }

    if (!this.enemies || this.enemies.length === 0) {
      this.score = this.profile.win.impact
      return;
    }

    score = score + (this.profile.playerHealth.impact * this.player.health)

    score = score + (this.enemies.reduce((acc, enemy) => acc + enemy.health, 0) * this.profile.enemyHealth.impact);

    const biggestEnemy = this.enemies.sort((a, b) => b.body.length - a.body.length)[0];
    if (biggestEnemy) {
      const relativeImpact = (this.player.body.length - biggestEnemy.body.length) * this.profile.relativeLength.impact
      score = score + Math.min(Math.max(relativeImpact, -20), 20)
    }

    score = score + (this.enemies.length * this.profile.enemyCount.impact);

    this.enemies.forEach(snake => {
      const proximity = Pathfinder.find(this.player.head, snake.head, this.grid).length
      if (snake.body.length < this.player.body.length) {
        score = score + (proximity * this.profile.smallSnakeProximity.impact)
      } else {
        score = score + (proximity * this.profile.dangerSnakeProximity.impact)
      }
    })

    if (this.history.killBonus) {
      score = score + this.profile.killBonus.impact
    }

    if (this.player.health < this.profile.hungry.threshold) {
      score = score + this.profile.hungry.impact
    }

    if (this.player.health < this.profile.starving.threshold) {
      score = score + this.profile.starving.impact
    }

    this.score = score
  }

  /**
   * Creates all possible scenarios after this one.
   */
  public createChildren() {
    if (this.isEnd) {
      return;
    }

    const possibleMoves = this.snakes.map(snake =>
      snake.possibleNextHeadPositions.map(point => ({ ...point, id: snake.id }))
    );

    const possibleCombinations = fastCartesian(possibleMoves) as { x: number, y: number, id: string }[][];

    this.children = possibleCombinations.map((combination) => {

      const newHistory: ScenarioHistory = {
        killBonus: false,
        ate: [],
        age: this.history.age + 1
      }
      // Get a list of all new snakes.
      const newSnakes: Snake[] = combination.map(newLocation => {
        const { id, ...newHead } = newLocation;

        const currentSnake = this.snakes.find(s => s.id === id);
        return currentSnake.move(newHead, this.history.ate.includes(id));
      })

      console.assert(newSnakes.every(snake => snake), "One or more new snakes is not defined", newSnakes, combination, this.snakes)

      // Remove any ate food, and pass the new ate status on
      const newFood = this.food.filter(food => !newSnakes.some(snake => {
        const willEat = isSamePoint(snake.head, food);

        if (willEat) {
          newHistory.ate.push(snake.id)
        }

        return willEat
      }));

      // Remove any snakes that have collided with another snake
      const survivedSnakes = newSnakes.filter(snake => {
        const isPlayer = snake.id === this.player.id

        const isInBounds = isPointOnBoard(snake.head, this.height, this.width);

        const diedToCollision = newSnakes.filter(testSnake => testSnake.id !== snake.id).some(testSnake => {
          // Have these snakes collided?
          if (isSamePoint(snake.head, testSnake.head)) {
            // If this snake is longer, it has survived.  If it's the player, ensure we track the killBonus state
            if (snake.length > testSnake.length) {
              if (isPlayer) this.history.killBonus = true;
              return false;
            }

            return true;
          }

          // If this snake is in a body of another snake, it has died
          return testSnake.body.some(segment => isSamePoint(segment, snake.head))
        })

        return (isInBounds && !diedToCollision);
      })

      const newPlayer = survivedSnakes.find(snake => snake.id === this.player.id);

      return new Scenario(
        this.width,
        this.height,
        newPlayer,
        newSnakes.filter(snake => snake.id !== this.player.id),
        newFood,
        this.profile,
        newHistory
      )
    })

  }
}

export default Scenario



