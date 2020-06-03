import { Request, Response } from "express"

function end(request: Request<{}, string, GameState>, response: Response<string>) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}

export default end
