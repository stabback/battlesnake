import { Request, Response } from 'express'
import { InfoResponse } from '@/types'

function info(request: Request, response: Response<InfoResponse>) {
    const battlesnakeInfo = {
        apiversion: '1',
        author: 'Josh Stabback',
        color: '#CA7E7E',
        head: 'shac-tiger-king',
        tail: 'shac-tiger-tail'
    }

    response.status(200).json(battlesnakeInfo)
}

export default info
