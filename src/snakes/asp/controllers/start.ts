import { Request, Response } from "express"

function start(request: Request<{}, string, GameState>, response: Response<string>) {
  var GameState = request.body

  console.log('START')
  response.status(200).send('ok')
}

export default start
