import Scenario from './Scenario'
import { GameState, Move, Point } from '@/types'
import Snake from './Snake'
import Controller from './Controller'
import getMoveFromPoints from '@/utils/get-move-from-points'

const DEFAULT_NETWORK_LATENCY = 250

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

    /** The maximum amount of time we should let pass before we send back a response on a move request */
    public get maxResponseTime() {
        return this.timeout - this.latency
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

        this.currentScenario.createChildren()
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
            this.latency = this.latency + 10
        }
    }

    public end(): void {
        Controller.removeGame(this.id)
    }

    public start(): void {
        Controller.addGame(this)
    }

    public async move(): Move {}
}

export default Game
