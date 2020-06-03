import { Request, Response } from "express"

function info(request: Request, response: Response<InfoResponse>) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Josh Stabback',
    color: '#BADA55',
    head: 'default',
    tail: 'default'
  }

  response.status(200).json(battlesnakeInfo)
}

export default info
