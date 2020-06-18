import { Request, Response } from 'express'
import { InfoResponse } from '@/types'

function info(request: Request, response: Response<InfoResponse>) {
    const battlesnakeInfo = {
        apiversion: '1',
        author: 'Josh Stabback',
        color: '#D0605E',
        head: 'smile',
        tail: 'curled'
    }

    response.status(200).json(battlesnakeInfo)
}

export default info
