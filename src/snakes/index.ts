import express from 'express'
import starter from './starter'
import asp from './asp'
import bushmaster from './bushmaster'
import catEyed from './cat-eyed'
import dogNose from './dog-nose'
import eggEater from './egg-eater'

const router = express.Router()

router.use('/egg-eater', eggEater)

export default router
