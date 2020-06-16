import { Request, Response } from "express"
import { GameState } from "@/types";
import Controller from "../classes/Controller";
import Game from "../classes/Game";

function start(request: Request<{}, string, GameState>, response: Response<string>) {
  const state = request.body

  console.log("Starting game - TIMEOUT", state.game.timeout)

  Controller.addGame(new Game(state))

  response.status(200).send('ok')
}

export default start
