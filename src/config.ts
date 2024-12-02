import 'dotenv/config'
import path from 'path'

const env = process.env
const config = {
	port: env.PORT || '4000',
	base: env.BASE_PATH || '/',
	allowedOrigins: env.ALLOWED_ORIGINS,
	uploadDir: env.UPLOAD_DIR || path.join(__dirname, 'uploads'),
	jwtSecret: env.JWT_SECRET || '',
	mail: {
		server: env.MAIL_SERVER || '',
		user: env.MAIL_USER || '',
		pass: env.MAIL_PASS || '',
		from: env.MAIL_FROM || ''
	},
	dev: (env.NODE_ENV || 'development') === 'development'
}

if (config.dev)
	console.warn('Running in development environment')

export default config
