import express from 'express'
import config from './config'
import fs from 'fs'
import cors from 'cors'
import { router } from './router'
import { WebSocketServer } from 'ws'
import { onGatewayConnection, removeDeadClients } from './gateway'

const app = express()
const allowedOrigins = config.allowedOrigins?.split(',').map(origin => origin.trim())

if (!fs.existsSync(config.uploadDir))
	fs.mkdirSync(config.uploadDir, { recursive: true })

app.use(cors({
	credentials: true,
	origin: (origin, callback) => {
		if (!origin || !allowedOrigins || allowedOrigins.includes('*') || allowedOrigins.includes(origin))
			callback(null, true)
		else
			callback(new Error('Not allowed by CORS'))
	}
}))
app.use(express.json())
app.use(config.base, router)

const server = app.listen(config.port, () => {
	console.log(`Server running on http://localhost:${config.port}`)
})
const gateway = new WebSocketServer({ server })

gateway.on('connection', onGatewayConnection)
setInterval(removeDeadClients, 30000)
