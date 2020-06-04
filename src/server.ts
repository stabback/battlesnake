/* tslint:disable: no-console */

import 'module-alias/register';

import dotenv from "dotenv"
import bodyParser from 'body-parser'
import express from 'express'
import snakes from '@/snakes'
import logs from '@/logger'
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.use('/snakes', snakes)
app.use('/logs', logs)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.listen(PORT, () =>
  console.log(`Example app listening at http://127.0.0.1:${PORT}`)
)
