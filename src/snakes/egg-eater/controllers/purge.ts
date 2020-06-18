import { Request, Response } from "express"
import Oracle from "../classes/Oracle"

function purge(request: Request, response: Response) {

  Oracle.reset();

  response.status(200).send('oracle is reset!')
}

export default purge
