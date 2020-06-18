import Simulator from './Simulator'
import Game from './Game'

/**
 * Controller singleton for this snake.  Maintains a list of running games
 * and tracks other singletons
 */
class ControllerClass {
    public simulator = new Simulator()

    private games: Game[] = []

    addGame(game: Game) {
        this.games.push(game)

        // Add all the child scenarios to Oracles work queue
        if (
            game.currentScenario.children &&
            game.currentScenario.children.length > 0
        ) {
            game.currentScenario.children.forEach(scenario =>
                this.simulator.addWorkItem(scenario)
            )
        }
    }

    getGame(id: string) {
        return this.games.find(game => game.id === id)
    }

    /** Should only be called from the Game class.  The Game class should contain teardown logic. */
    removeGame(id: string) {
        this.games = this.games.filter(game => game.id !== id)
        this.simulator.removeWorkMatchingGame(id)
    }
}

const Controller = new ControllerClass()

export default Controller
