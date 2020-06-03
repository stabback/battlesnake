import bodyParser from 'body-parser'
import express from 'express'
import snakes from './snakes'

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.use('/snakes', snakes)

app.listen(PORT, () =>
  console.log(`Example app listening at http://127.0.0.1:${PORT}`)
)
