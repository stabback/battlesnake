import crypto from 'crypto'
import fastCartesian from 'fast-cartesian'

import Snake from '@/classes/Snake'
import { Point, Move } from '@/types'
import isSamePoint from '@/utils/is-same-point'
import isPointOnBoard from '@/utils/is-point-on-board'
import applyMoveToPoint from '@/utils/apply-move-to-point'
import getMoveFromPoints from '@/utils/get-move-from-points'
import Game from './Game'
import { Grid } from 'pathfinding'
import Pathfinder from '@/utils/find-path'

/**
 * Describes the chances this scenario has of different results
 */
interface Outcome {
    /** Chance this scenario results in a win */
    win: number

    /** Chance this scenario results in the player losing */
    lose: number

    /** Chance this scenario results in a win or a loss, we can't see that far ahead yet */
    unknown: number
}

interface DescribedPoint extends Point {
    safe: boolean
}

/** A list of the the next potential snake head positions */
type Possibilities = { x: number; y: number; id: string }[][]

/** Describes the outcomes of different moves */
type OutcomeByMove = { [key in Move]: Outcome }

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

    /** All likely future snake head states */
    public possibilities: Possibilities = []

    /**
     * Snakes used for calculations.  Calculated by itself and only available
     * on the parent.
     */
    public calculatedValues: {
        snakes: Snake[]
        smallerSnakes: Snake[]
        threatSnakes: Snake[]
        playerIsDominant: boolean
        points: DescribedPoint[]
        grid: Grid
    } = {
        snakes: null,
        smallerSnakes: null,
        threatSnakes: null,
        playerIsDominant: null,
        points: null,
        grid: null
    }

    /** How many scenarios away from the base scenario this scenario is */
    public get age(): number {
        if (this.parent) {
            return this.parent.age + 1
        }

        return 1
    }

    /** A list of all moves our snake can make from this position */
    public get possibleMoves(): Move[] {
        return [...new Set(this.children.map(child => child.move))].sort()
    }

    /** Outcomes for all valid moves */
    public get outcomeByMove(): Partial<OutcomeByMove> {
        if (!this.children || !this.player) {
            return {}
        }

        // Get a mapping of how many possibilities may come from each move we do
        const possibilitiesByMove = this.children.reduce(
            (acc, child) => {
                return {
                    ...acc,
                    [child.move]: acc[child.move] + 1
                }
            },
            { up: 0, left: 0, right: 0, down: 0 }
        )

        // Add all outcomes together by move
        const outcomes = this.children.reduce(
            (acc: Partial<OutcomeByMove>, child: Scenario) => {
                const currentOutcome: Outcome = acc[child.move]
                    ? {
                          ...acc[child.move]
                      }
                    : {
                          win: 0,
                          lose: 0,
                          unknown: 0
                      }

                return {
                    ...acc,
                    [child.move]: {
                        win: child.outcome.win + currentOutcome.win,
                        lose: child.outcome.lose + currentOutcome.lose,
                        unknown: child.outcome.unknown + currentOutcome.unknown
                    }
                }
            },
            {}
        )

        // Divide the outcomes by the number of possibilities to determine the chances of a result
        Object.keys(outcomes).forEach((move: Move) => {
            outcomes[move].win = outcomes[move].win / possibilitiesByMove[move]
            outcomes[move].lose =
                outcomes[move].lose / possibilitiesByMove[move]
            outcomes[move].unknown =
                outcomes[move].unknown / possibilitiesByMove[move]
        })

        return outcomes
    }

    /** Rearrange the outcomes into an array for easier parsing */
    public get moveOdds(): { move: Move; winOdds: number; loseOdds: number }[] {
        return Object.keys(this.outcomeByMove).map((move: Move) => {
            return {
                move,
                loseOdds: this.outcomeByMove[move].lose,
                winOdds: this.outcomeByMove[move].win
            }
        })
    }

    /** Determine which move has the lowest chance of losing */
    public get safestMove(): Move {
        if (this.moveOdds.length > 0) {
            return this.moveOdds.sort((a, b) => a.loseOdds - b.loseOdds)[0].move
        }

        return 'up'
    }

    constructor(
        public player: Snake,
        public enemies: Snake[],
        public food: Point[],
        public ate: string[],
        public game: Game,
        public parent?: Scenario,
        public move?: Move
    ) {
        /** Create a unique hash for this scenario to help compare against future game states */
        this.id = crypto
            .createHash('sha1')
            .update(
                JSON.stringify({
                    player: player ? player.data.body : null,
                    enemies: enemies
                        ? enemies.map(enemy => enemy.data.body)
                        : null,
                    food,
                    ate
                })
            )
            .digest('base64')

        if (!player) {
            this.outcome.lose = 1
        } else if (enemies.length === 0) {
            this.outcome.win = 1
        } else {
            const snakes = [player, ...enemies]

            // Get a list of likely next head positions for snakes.  Likely here is defined as positions for each snake
            // where they do not immediately run off the map or against another snake.
            const likelyNextHeadPositions = snakes.map(snake => {
                const possiblePositions = snake.possibleNextHeadPositions

                const possibleSurvivalPositions = possiblePositions.filter(
                    point =>
                        snakes.every(s => {
                            const bodyWithoutTail = s.body.slice(
                                0,
                                s.body.length - 1
                            )
                            return !bodyWithoutTail.some(segment =>
                                isSamePoint(point, segment)
                            )
                        })
                )

                // If there are no survival positions, just assume up
                if (possibleSurvivalPositions.length === 0) {
                    possibleSurvivalPositions.push(
                        applyMoveToPoint(snake.head, 'up')
                    )
                }

                // Add the snake ID to help track it
                return possibleSurvivalPositions.map(point => ({
                    ...point,
                    id: snake.id
                }))
            })

            // Get all possible combinations of likely head positions for the simulator
            this.possibilities = fastCartesian(
                likelyNextHeadPositions
            ) as Possibilities

            this.outcome.unknown = 1
        }
    }

    /**
     * Calculates the outcome for this scenario.  Averages the odds for each child together
     *
     * This is done as a step instead of as a getter so that the result is readily
     * available.  We don't want the final calculation to take time for performance reasons.
     */
    public calculateOutcome() {
        // If there are no child scenarios, the win/loss would have already been calculated
        // in the constructor
        if (!this.children || this.children.length === 0) return

        const newOutcome: Outcome = {
            win: 0,
            lose: 0,
            unknown: 0
        }

        // Add the outcome for all children together
        this.children.forEach(child => {
            newOutcome.win = newOutcome.win + child.outcome.win
            newOutcome.lose = newOutcome.lose + child.outcome.lose
            newOutcome.unknown = newOutcome.unknown + child.outcome.unknown
        })

        // Average out all outcomes
        newOutcome.win = newOutcome.win / this.children.length
        newOutcome.lose = newOutcome.lose / this.children.length
        newOutcome.unknown = newOutcome.unknown / this.children.length

        this.outcome = newOutcome

        // Get the parent to recalculate its outcome
        if (this.parent) {
            this.parent.calculateOutcome()
        }
    }

    /**
     * Create scenarios for each possible snake movement
     */
    public createChildren() {
        if (this.possibilities.length === 0) {
            return
        }

        const snakes = [this.player, ...this.enemies]

        this.children = this.possibilities.map(combination => {
            // Get a list of all new snakes.
            const newSnakes: Snake[] = combination.map(newLocation => {
                const { id, ...newHead } = newLocation

                const isEating = this.food.some(food =>
                    isSamePoint(food, newHead)
                )
                const didEat = this.ate.some(
                    snakeThatAteId => snakeThatAteId === id
                )

                const currentSnake = snakes.find(s => s.id === id)
                const newSnake = currentSnake.move(newHead, didEat)

                if (isEating) {
                    newSnake.health = 80
                } else {
                    newSnake.health = newSnake.health - 1
                }

                return newSnake
            })

            const move: Move = getMoveFromPoints(
                this.player.head,
                newSnakes.find(s => s.id === this.player.id).head
            )

            // Remove any ate food, and pass the new ate status on
            // TODO this should be done in the prior loop
            const newAte: string[] = []
            const newFood = this.food.filter(
                food =>
                    !newSnakes.some(snake => {
                        const willEat = isSamePoint(snake.head, food)
                        if (willEat) {
                            newAte.push(snake.id)
                        }
                        return willEat
                    })
            )

            // Remove any snakes that have collided with another snake
            const survivedSnakes = newSnakes.filter(snake => {
                const diedToCollision = newSnakes
                    .filter(testSnake => testSnake.id !== snake.id)
                    .some(testSnake => {
                        // Have these snakes collided?
                        if (isSamePoint(snake.head, testSnake.head)) {
                            // If this snake is longer, it has survived.  If it's the player, ensure we track the killBonus state
                            return snake.length <= testSnake.length
                        }

                        // If this snake is in a body of another snake, it has died
                        return testSnake.body.some(segment =>
                            isSamePoint(segment, snake.head)
                        )
                    })

                const isOnBoard = isPointOnBoard(
                    snake.head,
                    this.game.height,
                    this.game.width
                )

                const starved = snake.health <= 0

                return !diedToCollision && !starved && isOnBoard
            })

            const newPlayer = survivedSnakes.find(
                snake => snake.id === this.player.id
            )

            return new Scenario(
                newPlayer,
                survivedSnakes.filter(snake => snake.id !== this.player.id),
                newFood,
                newAte,
                this.game,
                this,
                move
            )
        })

        this.calculateOutcome()
    }

    /**
     * Should only be called on the parent scenario.  Calculates shortcuts
     * so that they aren't continually recalculated.
     */
    public calculateSnakeShortcuts() {
        this.calculatedValues.snakes = [this.player, ...(this.enemies || [])]
            .filter(snake => snake)
            .sort((a, b) => b.body.length - a.body.length)

        this.calculatedValues.smallerSnakes = this.enemies.filter(
            snake => snake.body.length < this.player.body.length
        )
        this.calculatedValues.threatSnakes = this.enemies.filter(
            snake => snake.body.length >= this.player.body.length
        )

        this.calculatedValues.playerIsDominant = false

        const biggestEnemy = (this.enemies || []).sort(
            (a, b) => b.body.length - a.body.length
        )[0]

        if (biggestEnemy) {
            this.calculatedValues.playerIsDominant =
                this.player.length - biggestEnemy.length >= 2
        }

        this.calculatedValues.points = []

        for (let i = 0; i < this.game.height * this.game.width; i++) {
            const point = {
                x: i % this.game.width,
                y: Math.floor(i / this.game.height)
            }

            const safe = this.game.isPointSafe(point)

            this.calculatedValues.points.push({
                ...point,
                safe
            })
        }

        this.calculatedValues.grid = Pathfinder.createGrid(
            this.game.width,
            this.game.height
        )

        this.calculatedValues.points.forEach(point => {
            this.calculatedValues.grid.setWalkableAt(
                point.x,
                point.y,
                point.safe
            )
        })

        this.calculatedValues.grid.setWalkableAt(
            this.player.head.x,
            this.player.head.y,
            true
        )
    }
}

export default Scenario
