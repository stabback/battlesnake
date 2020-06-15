import crypto from 'crypto'
import fastCartesian from 'fast-cartesian';

import Snake from '@/classes/Snake';
import { Point, Move } from '@/types';
import isSamePoint from '@/utils/is-same-point';
import isPointOnBoard from '@/utils/is-point-on-board';
import Controller from './Controller';
import applyMoveToPoint from '../../../utils/apply-move-to-point';
import getMoveFromPoints from '@/utils/get-move-from-points';

interface Outcome {
  win: number,
  lose: number,
  unknown: number
}

type Possibilities = { x: number, y: number, id: string }[][]


class Scenario {
  /** Unique id for this specific scenario */
  public id: string

  /** An object describing all known outcomes for this scenario */
  public outcome: Outcome = {
    win: 0,
    lose: 0,
    unknown: 0
  }

  /** An array consisting of direct child scenarios */
  public children: Scenario[]

  public childOutcomes: { [key: string]: Outcome }

  public possibilities: Possibilities = []

  public get possibleMoves(): Move[] {
    return [...new Set(this.possibilities
      .map(possibility => possibility.filter(p => p.id === this.player.id))
      .filter(possibility => possibility.length === 1)
      .map(possibility => possibility[0])
      .map(point => getMoveFromPoints(this.player.head, point)))].sort()
  }

  public bestMove: Move;

  constructor(
    public player: Snake,
    public enemies: Snake[],
    public food: Point[],
    public ate: string[],
    private gameId: string,
    readonly width: number,
    readonly height: number,
    public parent?: Scenario,
  ) {

    this.id = crypto.createHash('sha1').update(JSON.stringify({
      player, enemies, food, ate, parent: parent ? parent.id : ''
    })).digest('base64')

    if (!player) {
      this.outcome.lose = 1
    } else if (enemies.length === 0) {
      this.outcome.win = 1
    } else {

      const snakes = [player, ...enemies]

      const likelyNextHeadPositions = snakes.map(snake => {

        const possiblePositions = snake.possibleNextHeadPositions

        const possibleSurvivalPositions = possiblePositions.filter(point => snakes.every(s => {
          const bodyWithoutTail = s.body.slice(0, s.body.length - 1)
          return !bodyWithoutTail.some(segment => isSamePoint(point, segment))
        }))

        // If there are no survival positions, just assume up
        if (possibleSurvivalPositions.length === 0) {
          possibleSurvivalPositions.push(applyMoveToPoint(snake.head, 'up'))
        }

        // Adds the snake ID to help track it
        return possibleSurvivalPositions.map(point => ({ ...point, id: snake.id }))
      })

      this.possibilities = fastCartesian(likelyNextHeadPositions) as Possibilities;

      this.outcome.unknown = this.possibilities.length
    }

    if (this.parent) {
      this.parent.resolveChildOutcome(this.outcome)

      Controller.addWorkItem(this)
    }
  }

  public resolveChildOutcome(outcome: Outcome) {
    this.outcome.unknown = this.outcome.unknown - 1;
    this.outcome = {
      win: this.outcome.win + outcome.win,
      lose: this.outcome.lose + outcome.lose,
      unknown: this.outcome.unknown + outcome.unknown,
    }

    if (this.parent) {
      this.parent.resolveChildOutcome(this.outcome)
    }
  }

  public activate() {
    this.parent = null;
  }

  public createChildren() {

    if (this.possibilities.length === 0) { return; }

    const snakes = [this.player, ...this.enemies]

    this.children = this.possibilities.map(combination => {

      // Get a list of all new snakes.
      const newSnakes: Snake[] = combination.map(newLocation => {
        const { id, ...newHead } = newLocation;

        const isEating = this.food.some(food => isSamePoint(food, newHead))
        const didEat = this.ate.some(snakeThatAteId => snakeThatAteId === id)

        const currentSnake = snakes.find(s => s.id === id);
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
      const newAte: string[] = [];
      const newFood = this.food.filter(food => !newSnakes.some(snake => {
        const willEat = isSamePoint(snake.head, food);
        if (willEat) {
          newAte.push(snake.id)
        }
        return willEat
      }));

      // Remove any snakes that have collided with another snake
      const survivedSnakes = newSnakes.filter(snake => {
        const diedToCollision = newSnakes.filter(testSnake => testSnake.id !== snake.id).some(testSnake => {
          // Have these snakes collided?
          if (isSamePoint(snake.head, testSnake.head)) {
            // If this snake is longer, it has survived.  If it's the player, ensure we track the killBonus state
            return  (snake.length <= testSnake.length)
          }

          // If this snake is in a body of another snake, it has died
          return testSnake.body.some(segment => isSamePoint(segment, snake.head))
        })

        const isOnBoard = isPointOnBoard(snake.head, this.height, this.width);

        const starved = snake.health <= 0

        return (!diedToCollision && !starved && isOnBoard);
      })

      const newPlayer = survivedSnakes.find(snake => snake.id === this.player.id);

      return new Scenario(
        newPlayer,
        survivedSnakes.filter(snake => snake.id !== this.player.id),
        newFood,
        newAte,
        this.gameId,
        this.width,
        this.height,
        this
      )
    })

  }
}

export default Scenario