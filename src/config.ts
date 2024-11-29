import 'dotenv/config'
import path from 'path'

const env = process.env
const config = {
	port: env.PORT || '4000',
	base: env.BASE_PATH || '/',
	uploadDir: env.UPLOAD_DIR || path.join(__dirname, 'uploads'),
	allowedOrigins: env.ALLOWED_ORIGINS,
	jwtSecret: env.JWT_SECRET || '',
	dev: (env.NODE_ENV || 'development') === 'development'
}

if (config.dev)
	console.warn('Running in development environment')

export default config
