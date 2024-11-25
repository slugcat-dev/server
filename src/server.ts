import express from 'express'
import fs from 'fs'
import config from './config'
import cors from 'cors'
import { router } from './router'

const app = express()

if (!fs.existsSync(config.uploadDir)) {
	console.warn(`Creating "${config.uploadDir}"`)
	fs.mkdirSync(config.uploadDir, { recursive: true })
}

app.use(cors({
	credentials: true,
	origin: config.allowedOrigins
}))

app.use(config.base, router)

app.listen(config.port, () => {
	console.log(`Server running on http://localhost:${config.port}`)
})
