import express from 'express'
import config from './config'
import fs from 'fs'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { router } from './router'

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
app.use(cookieParser())
app.use(config.base, router)

app.listen(config.port, () => {
	console.log(`Server running on http://localhost:${config.port}`)
})
