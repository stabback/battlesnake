import { Request, Response } from "express"

function scenario(request: Request<{}, string, GameState>, response: Response<string>) {
  response.render('scenario/scenario')
}

export default scenario
