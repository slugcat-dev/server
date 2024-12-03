import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'
import db from '../db'

export function auth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization

	if (!authHeader)
		return void res.status(403).send('Acces denied')

	try {
		const { uid } = jwt.verify(authHeader.split(' ')[1], config.jwtSecret) as { uid: string }
		const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid) as UserRecord | undefined

		if (!user)
			return void res.status(403).send('Invalid user')

		req.user = user

		next()
	} catch {
		res.status(403).send('Invalid token')
	}
}
