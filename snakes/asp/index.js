const express = require('express')
const controllers = require('./controllers')

const router = express.Router()

router.get('/', controllers.info)
router.post('/start', controllers.start)
router.post('/move', controllers.move)
router.post('/end', controllers.end)

module.exports = router
