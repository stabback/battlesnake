import { Request, Response } from "express"
import Scenario, { ScenarioHistory } from "../classes/Scenario"
import { RiskProfile } from "../constants/risk-profiles"
import Snake from "@/classes/Snake"
import { SnakeData, Point } from "@/types"

interface ScenarioArguments {
  width: number,
  height: number,
  player: SnakeData,
  enemies: SnakeData[],
  food: Point[],
  profile: RiskProfile,
  history: ScenarioHistory
}

function scenario(request: Request<{}, string, {}, { scenarioArgs: string, childDepth: number }>, response: Response<string>) {
  let scenarioArgs: ScenarioArguments
  try {
    scenarioArgs = JSON.parse(request.query.scenarioArgs)
  // tslint:disable-next-line: no-empty
  } finally { }

  let scenarioInstance: Scenario;

  if (scenarioArgs) {
    scenarioInstance = new Scenario(
      scenarioArgs.width,
      scenarioArgs.height,
      new Snake(scenarioArgs.player, scenarioArgs.width, scenarioArgs.height),
      scenarioArgs.enemies.map(data => new Snake(data, scenarioArgs.width, scenarioArgs.height)),
      scenarioArgs.food,
      scenarioArgs.profile,
      scenarioArgs.history,
    )

    scenarioInstance.createChildren();
  }




  response.render('scenario/scenario', { scenario: scenarioInstance })
}

export default scenario
