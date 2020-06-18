import { Request, Response } from 'express'
import Simulator from '../classes/Simulator'
import Controller from '../classes/Controller'

function purge(request: Request, response: Response) {
    Controller.simulator.reset()

    response.status(200).send('oracle is reset!')
}

export default purge
