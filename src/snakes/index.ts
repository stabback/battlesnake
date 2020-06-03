import express from 'express'
import starter from './starter'
import asp from './asp'

const router = express.Router()

router.use('/starter', starter)
router.use('/asp', asp)

export default router
