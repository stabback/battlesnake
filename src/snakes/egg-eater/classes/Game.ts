import Scenario from './Scenario'
import { GameState, Move, Point } from '@/types'
import Snake from './Snake'
import Controller from './Controller'
import getMoveFromPoints from '@/utils/get-move-from-points'
import isSamePoint from '@/utils/is-same-point'
import applyMoveToPoint from '@/utils/apply-move-to-point'
import isPointOnBoard from '@/utils/is-point-on-board'
import strategies from '../strategies'
import chalk from 'chalk'

const DEFAULT_NETWORK_LATENCY: number =
    parseInt(process.env.DEFAULT_NETWORK_LATENCY, 10) || 250

type strategies = 'pressure' | 'feed' | 'survive'

class Game {
    /** Current scenario - represents the current state of the game */
    public currentScenario: Scenario

    /** ID of the game as determined by battlesnakes */
    readonly id: string

    /** Time before battlesnakes ignores our response */
    readonly timeout: number

    /** Width of the board */
    readonly width: number

    /** Height of the board */
    readonly height: number

    /** Describes the move we sent to battlesnakes last */
    public previousMove: Move

    /** Represents the amount of time we should allocate to network latency */
    private latency = DEFAULT_NETWORK_LATENCY

    private turn = 0

    /** The maximum amount of time we should let pass before we send back a response on a move request */
    public get maxResponseTime() {
        return this.timeout - this.latency
    }

    public get riskTolerance() {
        if (this.currentScenario.enemies.length === 1) {
            return {
                lose: 0.35
            }
        } else if (this.currentScenario.enemies.length === 2) {
            return {
                lose: 0.2
            }
        } else if (this.currentScenario.enemies.length === 3) {
            return {
                lose: 0.15
            }
        } else {
            return {
                lose: 0.1
            }
        }
    }

    constructor(state: GameState) {
        // Store the base attributes that should be consistent for the life of the game
        this.id = state.game.id
        this.timeout = state.game.timeout
        this.width = state.board.width
        this.height = state.board.height

        // Create the initial scenario representing game state
        const player = new Snake(state.you, this.width, this.height)
        const enemies = state.board.snakes
            .filter(snake => snake.id !== player.id)
            .map(snake => new Snake(snake, this.width, this.height))

        this.currentScenario = new Scenario(
            player,
            enemies,
            state.board.food,
            [],
            this
        )

        if (enemies.length < 4) {
            this.currentScenario.createChildren()
        }

        this.currentScenario.calculateSnakeShortcuts()
    }

    /**
     * Attempts to adjust for changing Battlesnakes network latency.
     *
     * If the move that was received was not the move that was sent, send all future moves
     * 10ms faster.
     *
     * @param newHead The new head of the player
     */
    public adjustLatency(newHead: Point) {
        const previousHead = this.currentScenario.player.head
        const move = getMoveFromPoints(previousHead, newHead)

        if (move !== this.previousMove) {
            console.log(
                chalk.bgRed(
                    'Previous move did not register, adding to latency'
                ),
                this.latency,
                move,
                this.previousMove
            )
            this.latency = this.latency + 10
        }
    }

    public end(): void {
        Controller.removeGame(this.id)
    }

    public start(): void {
        Controller.addGame(this)
    }

    public async move(state: GameState, startTime: number): Promise<Move> {
        let strategy = ''

        const log: (any)[][] = []

        const startingWorkDone = Controller.simulator.statistics.totalWorkDone

        this.turn = state.turn
        log.push(['--------'])
        log.push(['[Move] start', this.id, this.turn])

        // See if our move was accepted and adjust latency
        this.adjustLatency(state.you.head)

        // Create the new scenario
        const player = new Snake(
            state.you,
            state.board.width,
            state.board.height
        )
        const enemies = state.board.snakes
            .filter(snake => snake.id !== player.id)
            .map(
                snake => new Snake(snake, state.board.width, state.board.height)
            )

        const ate = this.currentScenario.food
            .map(point =>
                state.board.snakes.find(snake =>
                    snake.body.some(segment => isSamePoint(point, segment))
                )
            )
            .filter(snake => snake)
            .map(snake => snake.id)

        const scenario = new Scenario(
            player,
            enemies,
            state.board.food,
            ate,
            this
        )

        // Update the Simulator
        Controller.simulator.updateRootScenario(scenario)
        const simulatorDone = new Promise(res =>
            Controller.simulator.notifyWhenDone(res)
        )

        // Resolve a move
        let move: Move = null

        if (
            this.currentScenario.calculatedValues.playerIsDominant &&
            this.currentScenario.player.health > 20
        ) {
            strategy = 'pressure'
            move = strategies.pressure(this.currentScenario)

            if (!move) {
                strategy = 'delay'
                move = strategies.delay(this.currentScenario)
            }
        }

        if (!move) {
            strategy = 'eat'
            move = strategies.eat(this.currentScenario)
        }

        // Wait for the Simulator / Timeout
        const timeout =
            this.maxResponseTime - (new Date().getTime() - startTime)

        if (Controller.simulator.isRunning) {
            log.push(['-- Simulator running, waiting for the response...'])
            await Promise.race([
                simulatorDone,
                new Promise(res => setTimeout(res, timeout))
            ])
        }

        log.push([
            '-- Took',
            new Date().getTime() - startTime,
            'ms',
            timeout,
            this.maxResponseTime
        ])

        log.push(['-- Our strategy recommends', move])

        const winningMove = this.currentScenario.moveOdds.find(
            m => m.winOdds >= 0.6
        )
        if (winningMove) {
            log.push(['-- The simulator has a winning move!', winningMove])
            move = winningMove.move
        }

        // Validate our move against the simulator
        if (move && this.currentScenario.children) {
            log.push(['-- Simulator is running, comparing results'])
            const outcome = this.currentScenario.outcomeByMove[move]

            if (!outcome) {
                log.push([
                    chalk.bgRed('Outcome for the specified move is not known!')
                ])
                if (
                    this.currentScenario.children &&
                    this.currentScenario.children.length > 0
                ) {
                    strategy = 'simulator'
                    move = this.currentScenario.safestMove
                }
            } else if (outcome.lose > this.riskTolerance.lose) {
                strategy = 'simulator'
                log.push([chalk.bgRed('Simulator intercepting, too risky!')])
                move = this.currentScenario.safestMove
            }
        } else if (!move) {
            log.push([
                chalk.bgYellow(
                    '-- No move decided on.  Defaulting to the safest move'
                )
            ])
            move = this.currentScenario.safestMove
        }
        log.push(['-- Strategy used', strategy])
        log.push(['-- Resolving to', move])
        log.push(['-- Odds', this.currentScenario.outcomeByMove])
        log.push([
            '-- Work done this call',
            Controller.simulator.statistics.totalWorkDone - startingWorkDone
        ])
        log.push(['-- Work remaining', Controller.simulator.workQueue.length])
        log.push([''])

        log.forEach(line => console.log(...line))

        this.previousMove = move

        return move

        // Return our figure
    }

    /**
     * Determines if a point is safe to move into.
     */
    isPointSafe(point: Point): boolean {
        // Make sure the point is not in our snake excluding the tail
        if (
            this.currentScenario.player.intersects(
                point,
                this.currentScenario.ate.includes(
                    this.currentScenario.player.id
                ),
                false
            )
        )
            return false

        if (
            this.currentScenario.calculatedValues.smallerSnakes.some(snake =>
                snake.intersects(point, true, false)
            )
        )
            return false

        if (
            this.currentScenario.calculatedValues.threatSnakes.some(snake =>
                snake.intersects(point, true, true)
            )
        )
            return false

        return true
    }

    /**
     * Determines if a move applied to the current snake is safe or not
     * @param move The move to apply to the player
     * @param lenient If lenient, we will allow the snake to move into _potentially_ deadly spots, but not spots that result in certain death
     */
    isMoveSafe(move: Move, lenient = false): boolean {
        const updatedHead = applyMoveToPoint(
            this.currentScenario.player.head,
            move
        )

        // Make sure the point is in the board
        if (!isPointOnBoard(updatedHead, this.height, this.width)) {
            return false
        }

        if (!lenient) {
            // Make sure the point is not currently occupied
            return this.isPointSafe(updatedHead)
        } else {
            return !this.currentScenario.calculatedValues.snakes.some(snake =>
                snake.intersects(updatedHead, false, false)
            )
        }
    }
}

export default Game
