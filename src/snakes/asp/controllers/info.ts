import { Request, Response } from "express"
import { InfoResponse } from "@/types"

function info(request: Request, response: Response<InfoResponse>) {
  const battlesnakeInfo = {
    apiversion: '1',
    author: 'Josh Stabback',
    color: '#BADA55',
    head: 'default',
    tail: 'default'
  }

  response.status(200).json(battlesnakeInfo)
}

export default info
