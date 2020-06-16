import Game from './Game';
import Scenario from '@/snakes/cat-eyed/classes/Scenario';


class ControllerClass {
  private games: Game[] = [];
  public workUnitsDone = 0;

  public workQueue: Scenario[] = [];

  public get runningGames() {
    return this.games.length
  }

  public getGame(id: string) {
    return this.games.find(game => game.id === id)
  }

  public endGame(id: string) {
    const game = this.getGame(id);

    if (!game) {
      return;
    }

    game.end();

    this.games = this.games.filter(g => g.id !== id);
  }

  public addGame(game: Game) {
    this.games.push(game)
  }

  public doWork() {
    if (this.workQueue.length === 0) return;

    this.workUnitsDone = this.workUnitsDone + 1;

    const scenario = this.workQueue.shift();

    scenario.createChildren();
  }

  public addWorkItem(scenario: Scenario) {
    if (scenario.age <= 7) {
      this.workQueue.push(scenario)
    }
  }
}

const Controller = new ControllerClass()

export default Controller