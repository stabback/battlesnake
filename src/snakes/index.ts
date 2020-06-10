import express from 'express'
import starter from './starter'
import asp from './asp'
import bushmaster from './bushmaster'

const router = express.Router()

router.use('/starter', starter)
router.use('/asp', asp)
router.use('/bushmaster', bushmaster)

export default router
