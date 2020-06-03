const express = require('express')
const starter = require('./starter')

const router = express.Router()

router.use('/starter', starter)

module.exports = router
