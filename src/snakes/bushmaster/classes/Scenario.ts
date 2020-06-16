import Snake from "@/classes/Snake";

import { RiskProfile, RiskCategories } from "../constants/risk-profiles";
import fastCartesian from 'fast-cartesian';
import Pathfinder, { Grid } from "@/utils/find-path";
import isSamePoint from "@/utils/is-same-point";
import isPointOnBoard from "@/utils/is-point-on-board";
import { AssertionError } from "assert";
import { Point } from "@/types";

export interface ScenarioHistory {
  killBonus: boolean,

  /** Array of IDs of snakes that ate last turn, and will be growing this turn */
  ate: string[],

  age?: number
}

class Scenario {

  public rubric: { [key in RiskCategories]: number } = {
    playerDead: 0,
    playerHealth: 0,
    enemyHealth: 0,
    relativeLength: 0,
    enemyCount: 0,
    smallSnakeProximity: 0,
    dangerSnakeProximity: 0,
    killBonus: 0,
    hungry: 0,
    starving: 0,
    win: 0,
  }

  /**
   * The score for this specific scenario, not taking into account future scenarios
   */
  public score: number = null;

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

  public snakes: Snake[];

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
    public food: Point[],
    private profile: RiskProfile,
    private history: ScenarioHistory
  ) {
    this.snakes = [this.player, ...this.enemies].filter(snake => snake)

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
    if (!this.player || this.player.length === 0) {
      this.rubric.playerDead = this.profile.playerDead.impact
      return;
    }

    if (!this.enemies || this.enemies.length === 0) {
      this.rubric.win = this.profile.win.impact
      return;
    }

    this.rubric.playerHealth = (this.profile.playerHealth.impact * this.player.health)

    this.rubric.enemyHealth = (this.enemies.reduce((acc, enemy) => acc + enemy.health, 0) * this.profile.enemyHealth.impact);

    const biggestEnemy = this.enemies.sort((a, b) => b.body.length - a.body.length)[0];
    if (biggestEnemy) {
      const relativeImpact = (this.player.body.length - biggestEnemy.body.length) * this.profile.relativeLength.impact
      this.rubric.relativeLength = Math.min(Math.max(relativeImpact, -20), 20)
    }

    this.rubric.enemyCount = (this.enemies.length * this.profile.enemyCount.impact);

    this.enemies.forEach(snake => {
      const path = Pathfinder.find(this.player.head, snake.head, this.grid)
      if (path.length === 0) return

      const proximity = path.length - 1
      if (snake.body.length < this.player.body.length) {
        this.rubric.smallSnakeProximity = (this.profile.smallSnakeProximity.impact / proximity)
      } else {
        this.rubric.dangerSnakeProximity = (this.profile.dangerSnakeProximity.impact / proximity)
      }
    })

    if (this.history.killBonus) {
      this.rubric.killBonus = this.profile.killBonus.impact
    }

    if (this.player.health < this.profile.hungry.threshold) {
      this.rubric.hungry = this.profile.hungry.impact
    }

    if (this.player.health < this.profile.starving.threshold) {
      this.rubric.starving = this.profile.starving.impact
    }

    this.score = Object.values(this.rubric).reduce((sum, item) => sum + item)
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

    this.children = possibleCombinations.map(combination => {

      const newHistory: ScenarioHistory = {
        killBonus: false,
        ate: [],
        age: this.history.age + 1
      }

      // Get a list of all new snakes.
      const newSnakes: Snake[] = combination.map(newLocation => {
        const { id, ...newHead } = newLocation;

        const isEating = this.food.some(food => isSamePoint(food, newHead))
        const didEat = this.history.ate.some(snakeThatAteId => snakeThatAteId === id)

        const currentSnake = this.snakes.find(s => s.id === id);
        const newSnake = currentSnake.move(newHead, didEat);

        if (isEating) {
          newSnake.health = 80;
        } else {
          newSnake.health = newSnake.health - 1
        }

        return newSnake
      })

      // Remove any ate food, and pass the new ate status on
      // TODO this should be done in the prior loop
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

        const starved = snake.health <= 0

        return (isInBounds && !diedToCollision && !starved);
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



