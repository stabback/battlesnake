const bodyParser = require('body-parser')
const express = require('express')
const snakes = require('./snakes')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.use('/snakes', snakes)

app.listen(PORT, () =>
  console.log(`Example app listening at http://127.0.0.1:${PORT}`)
)
