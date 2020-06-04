import { Request, Response } from "express"
import logger from "@/logger/logger"

function end(request: Request<{}, string, GameState>, response: Response<string>) {
  const state = request.body

  logger.endGame(state)

  response.status(200).send('ok')
}

export default end
