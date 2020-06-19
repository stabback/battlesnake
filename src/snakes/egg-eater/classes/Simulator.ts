import Scenario from './Scenario'
import Controller from './Controller'
import chalk from 'chalk'

/** Maximum distance in the future to attempt to resolve scenarios */
const MAX_AGE = 7

/**
 * Maximum amount of time to run Oracle since the last time the base scenario was switched.
 * This is to prevent run-away work in the event that our snake dies before the game ends
 */
const MAX_RUNTIME_BETWEEN_INTERACTIONS = 750

class Simulator {
    public isRunning = false

    /** Queue of scenarios which need children created */
    public workQueue: Scenario[] = []

    /** Scenarios which are too far in the future to parse.  Will be loaded from later. */
    public deferredWork: Scenario[] = []

    /** Timestamp indicating when the simulator was last interacted with */
    private interactionTimestamp = 0

    private callbacks: (() => void)[] = []

    public statistics = {
        totalWorkDone: 0,
        totalWorkTime: 0
    }

    public get isDone() {
        return !this.isRunning
    }

    /**
     * Removes all work items from a game.
     * @param gameId ID of the game which should be removed
     */
    public removeWorkMatchingGame(gameId: string) {
        // Remove all scenarios for this game from Oracles work queue
        this.workQueue = this.workQueue.filter(
            scenario => scenario.game.id !== gameId
        )

        this.deferredWork = this.deferredWork.filter(
            scenario => scenario.game.id !== gameId
        )
    }

    /**
     * Turns on the simulator.  Begins creating child scenarios and doing work.
     */
    public runSimulator() {
        if (!this.isRunning) {
            this.isRunning = true
            this.workLoop()
        }
    }

    /**
     * The main loop.  Will call itself while the simulator is on.
     */
    public workLoop() {
        if (this.isRunning) {
            this.doWork()
            setTimeout(() => this.workLoop(), 1)
        }
    }

    /**
     * Create child scenarios
     */
    public doWork() {
        const start = new Date().getTime()

        const timeSinceLastInteraction = start - this.interactionTimestamp

        if (
            this.workQueue.length === 0 ||
            timeSinceLastInteraction > MAX_RUNTIME_BETWEEN_INTERACTIONS
        ) {
            this.workDone()
            return
        }

        this.statistics.totalWorkDone = this.statistics.totalWorkDone + 1

        // Always work with the first item, FIFO to perform a breadth-first search
        const scenario = this.workQueue.shift()
        scenario.createChildren()
        if (scenario.children) {
            scenario.children.forEach(child => this.addWorkItem(child))
        }

        const end = new Date().getTime()
        const workTime = end - start

        this.statistics.totalWorkTime = this.statistics.totalWorkTime + workTime
    }

    /**
     * Add a scenario to the queue to have children created
     * @param scenario Scenario which will have children created
     */
    public addWorkItem(scenario: Scenario) {
        if (scenario.age <= MAX_AGE) {
            // If there are dead end scenarios, or scenarios where enemies or the player can only move one space, prioritize
            if (
                !scenario.enemies ||
                scenario.enemies.length === 0 ||
                scenario.enemies.some(
                    enemy => enemy.possibleNextHeadPositions.length === 1
                ) ||
                !scenario.player ||
                scenario.player.possibleNextHeadPositions.length === 1
            ) {
                this.workQueue.unshift(scenario)
            } else {
                // Otherwise, add to the end so breadth first search is
                this.workQueue.push(scenario)
            }
            this.runSimulator()
        } else {
            this.deferredWork.push(scenario)
        }
    }

    /**
     * Change the root scenario for the simulator.  Also updates
     * the game, so this should probably exist on the game instead somehow
     *
     * @todo Fix this dance.  Figure out where this should live.
     * @param scenario The new root scenario
     */
    public updateRootScenario(scenario: Scenario) {
        this.interactionTimestamp = new Date().getTime()

        const game = Controller.getGame(scenario.game.id)

        if (game.currentScenario.id === scenario.id) {
            return
        }

        const existingScenario = game.currentScenario.children
            ? game.currentScenario.children.find(
                  child => child.id === scenario.id
              )
            : null

        if (existingScenario) {
            console.log(
                chalk.dim(
                    'New root scenario is a known scenario',
                    existingScenario.id
                )
            )
            game.currentScenario = existingScenario
            game.currentScenario.parent = null
        } else {
            console.log(chalk.dim('New root scenario is an unknown scenario'))
            game.currentScenario = scenario
        }

        if (!game.currentScenario.children && scenario.enemies.length < 4) {
            scenario.createChildren()
            if (scenario.children) {
                scenario.children.forEach(child => this.addWorkItem(child))
            }
        }

        game.currentScenario.calculateSnakeShortcuts()

        this.workQueue = [
            ...this.workQueue
                .filter(s => s)
                .filter(s => isChild(s, game.currentScenario.id)),
            ...this.deferredWork
                .filter(s => s)
                .filter(s => isChild(s, game.currentScenario.id))
        ]

        this.deferredWork = []

        this.runSimulator()
    }

    /**
     * Handle teardown and notifying subscribers when there is no more work to do
     */
    private workDone() {
        this.isRunning = false
        this.callbacks.forEach(callback => callback())
    }

    /**
     * Register a callback to be called when Oracle has no more work to do
     * @param callback Callback to be called
     */
    public notifyWhenDone(callback: () => void) {
        if (this.isDone) {
            setTimeout(callback)
        } else {
            this.callbacks.push(callback)
        }
    }

    /**
     * Reset Oracle back to its default state
     */
    public reset() {
        this.isRunning = false
        this.workQueue = []
        this.deferredWork = []
        this.interactionTimestamp = 0
        this.callbacks = []
        this.statistics = {
            totalWorkDone: 0,
            totalWorkTime: 0
        }
    }
}

/**
 * Determine if a scenario is a child of another scenario
 * @param scenario Scenario to determine the heritage of
 * @param parentId The id of the parent we want to check
 */
function isChild(scenario: Scenario, parentId: string) {
    let subject = scenario

    if (!subject.parent) {
        return true
    }

    do {
        subject = subject.parent
    } while (subject.parent)

    return subject.id === parentId
}

export default Simulator
