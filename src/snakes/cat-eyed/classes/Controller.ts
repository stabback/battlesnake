import Game from './Game';
import Scenario from '@/snakes/cat-eyed/classes/Scenario';
import drawBoard from '@/debug/draw-board';


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
    console.log('')
    console.log("DOING WORK - Work items remaining", this.workQueue.length)
    if (this.workQueue.length === 0) return;

    this.workUnitsDone = this.workUnitsDone + 1;

    const scenario = this.workQueue.shift();

    scenario.createChildren();

    console.log("DONE WORK = Work items done total", this.workUnitsDone)
    console.log("")
  }

  public addWorkItem(scenario: Scenario) {
    console.log("-- Adding work item", scenario.id)
    const art = drawBoard(scenario.width, scenario.height, scenario.player, scenario.enemies, scenario.food);
    art.forEach(line => console.log(line))
    this.workQueue.push(scenario)
  }
}

const Controller = new ControllerClass()

export default Controller