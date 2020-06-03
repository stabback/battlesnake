const express = require('express')
const starter = require('./starter')
const asp = require('./asp')

const router = express.Router()

router.use('/starter', starter)
router.use('/asp', asp)

module.exports = router
