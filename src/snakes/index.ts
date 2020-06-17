import express from 'express'
import starter from './starter'
import asp from './asp'
import bushmaster from './bushmaster'
import catEyed from './cat-eyed'
import dogNose from './dog-nose'

const router = express.Router()

router.use('/starter', starter)
router.use('/asp', asp)
router.use('/bushmaster', bushmaster)
router.use('/cat-eyed', catEyed)
router.use('/dog-nose', dogNose)

export default router
