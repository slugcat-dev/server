import 'dotenv/config'
import fs from 'fs'
import express from 'express'
import path from 'path'
import cors from 'cors'
import { router } from 'express-file-routing'

const port = process.env.SERVER_PORT
const uploadDir = process.env.SERVER_UPLOAD_DIR

if (!uploadDir)
	throw Error('SERVER_UPLOAD_DIR is not defined')
else if (!fs.existsSync(uploadDir))
	fs.mkdirSync(uploadDir)

const app = express()
const dirname = path.dirname(new URL(import.meta.url).pathname)

app.use(cors())
app.use('/uploads', express.static(uploadDir))
app.use('/', await router({ directory: path.join(dirname, 'routes') }))

app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
