import 'dotenv/config'
import express, { type NextFunction, type Request, type Response } from 'express'
import path from 'path'
import cors from 'cors'
import { router } from 'express-file-routing'

const app = express()
const dirname = path.dirname(new URL(import.meta.url).pathname)
const port = process.env.SERVER_PORT

function logReqTime(req: Request, res: Response, next: NextFunction) {
	console.time(req.originalUrl)
	res.on('finish', () => console.timeEnd(req.originalUrl))
	next()
}

app.use(cors())
app.use(logReqTime)
app.use('/', await router({ directory: path.join(dirname, 'routes') }))
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
