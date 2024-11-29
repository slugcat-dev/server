import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'

export default function auth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization

	if (!authHeader) {
		res.status(403).send('Acces denied')

		return
	}

	const token = authHeader.split(' ')[1]

	try {
		req.user = jwt.verify(token, config.jwtSecret) as User

		next()
	} catch {
		res.status(403).send('Invalid token')
	}
}
