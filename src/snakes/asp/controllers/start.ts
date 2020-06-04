import { Request, Response } from "express"
import logger from "@/logger/logger"

function start(request: Request<{}, string, GameState>, response: Response<string>) {
  const state = request.body

  logger.startGame(state);

  response.status(200).send('ok')
}

export default start
