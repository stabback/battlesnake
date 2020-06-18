import Game from './Game';
import Scenario from '@/snakes/dog-nose/classes/Scenario';

const MAX_AGE = 7

const MAX_RUNTIME = 750;

class OracleClass {
  public games: Game[] = [];

  public run = false;

  public workQueue: Scenario[] = [];

  public deferredWork: Scenario[] = [];

  public workCount = 0;

  public totalWorkTime = 0;

  private runtime = 0;

  private callbacks: (() => void)[] = []

  public get isDone() {
    return !this.run
  }

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

    this.startLoop()
  }

  public startLoop() {
    if (!this.run) {
      this.run = true;
      this.workLoop();
    }
  }

  public workLoop() {
    if (this.run) {
      this.doWork()
      setTimeout(() => this.workLoop())
    }

  }

  public doWork() {
    const start = new Date().getTime();
    if (
      this.workQueue.length === 0 ||
      (start - this.runtime) > MAX_RUNTIME
    ) {
      this.workDone()
      return;
    }

    this.workCount = this.workCount + 1;
    const scenario = this.workQueue.shift();

    scenario.createChildren();
    const end = new Date().getTime();
    this.totalWorkTime = this.totalWorkTime + (end - start)
  }

  public addWorkItem(scenario: Scenario) {
    this.runtime = new Date().getTime();
    if (scenario.age <= MAX_AGE) {
      this.workQueue.push(scenario)
      this.startLoop();
    } else {
      this.deferredWork.push(scenario)
    }
  }

  public updateBaseScenario(scenario: Scenario) {
    const game = this.getGame(scenario.gameId);

    if (game.scenario.id === scenario.id) {
      return
    }

    const existingScenario = game.scenario.children?.find(child => child.id === scenario.id)

    if (existingScenario) {
      game.scenario = existingScenario
    } else {
      game.scenario = scenario
      scenario.createChildren();
    }

    this.workQueue = [
      ...this.workQueue.filter(s => isChild(s, game.scenario.id)),
      ...this.deferredWork.filter(s => isChild(s, game.scenario.id)),
    ]

    this.deferredWork = [];

    this.startLoop();
  }

  public workDone() {
    this.run = false;
    this.callbacks.forEach(callback => callback())
  }

  public notifyWhenDone(callback: () => void) {
    if (this.isDone) {
      setTimeout(callback);
    } else {
      this.callbacks.push(callback)
    }
  }
}

function isChild(scenario: Scenario, parentId: string) {
  let subject = scenario;

  do {
    subject = subject.parent
  } while (subject.parent)

  return subject.id === parentId

}

const Oracle = new OracleClass()

export default Oracle