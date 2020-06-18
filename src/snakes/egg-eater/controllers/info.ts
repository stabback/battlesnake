import { Request, Response } from 'express'
import { InfoResponse } from '@/types'

function info(request: Request, response: Response<InfoResponse>) {
    const battlesnakeInfo = {
        apiversion: '1',
        author: 'Josh Stabback',
        color: '#E66EA7',
        head: 'tongue',
        tail: 'bwc-flake'
    }

    response.status(200).json(battlesnakeInfo)
}

export default info
