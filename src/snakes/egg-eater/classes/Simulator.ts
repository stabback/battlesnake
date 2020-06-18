import Game from './Game'
import Scenario from './Scenario'
import Controller from './Controller'

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
            setTimeout(() => this.workLoop())
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
        scenario.children.forEach(child => this.addWorkItem(child))

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
            this.workQueue.push(scenario)
            this.runSimulator()
        } else {
            this.deferredWork.push(scenario)
        }
    }

    /**
     * Change the root scenario for the simulator.  This will
     *
     * TODO - this probably should exist in some form on the scenario - coming back
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
            game.currentScenario = existingScenario
        } else {
            game.currentScenario = scenario
            scenario.createChildren()
        }

        this.workQueue = [
            ...this.workQueue.filter(s => isChild(s, game.currentScenario.id)),
            ...this.deferredWork.filter(s =>
                isChild(s, game.currentScenario.id)
            )
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

    do {
        subject = subject.parent
    } while (subject.parent)

    return subject.id === parentId
}

export default Simulator
