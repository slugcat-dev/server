import 'dotenv/config'
import express from 'express'
import { router } from 'express-file-routing'
import cors from 'cors'
import path from 'path'

const app = express()
const dirname = path.dirname(new URL(import.meta.url).pathname)
const port = process.env.SERVER_PORT

app.use(cors())
app.use('/', await router({ directory: path.join(dirname, 'routes') }))

const server = app.listen(port, () => console.log(`Server running on http://localhost:${port}`))

process.on('SIGINT', () => {
	console.log('\nShutting down...')
	server.close(() => process.exit(0))
})
