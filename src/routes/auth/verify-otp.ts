import type { Request, Response } from 'express'
import db from '../../db'
import jwt from 'jsonwebtoken'
import config from '../../config'

export async function postVerifyOTP(req: Request, res: Response) {
	const { email, otp } = req.body

	if (!email || !otp)
		return void res.status(400).send('Email and OTP required')

	try {
		const otpRecord = db.prepare('SELECT * FROM otp WHERE email = ?').get(email) as OTPRecord | undefined

		if (!otpRecord)
			return void res.status(404).send('Email not found')

		if (otp.toUpperCase() !== otpRecord.otp || new Date(otpRecord.expires) < new Date())
			return void res.status(403).send('Invalid OTP')

		let user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as UserRecord | undefined

		if (!user) {
			const users = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }
			const insert = users.count
				? db.prepare('INSERT INTO users (email, created) VALUES (?, ?)')
				: db.prepare('INSERT INTO users (id, email, created) VALUES (?, ?, ?)')

			if (users.count)
				insert.run(email, new Date().toISOString())
			else
				insert.run(100000, email, new Date().toISOString())

			user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as UserRecord
		}

		const token = jwt.sign({ uid: user.id }, config.jwtSecret, { expiresIn: '30d' })

		res.cookie('token', token, {
			httpOnly: true,
			secure: !config.dev,
			maxAge: 30 * 24 * 60 * 60 * 1000,
			sameSite: 'strict'
		}).sendStatus(204)

		db.prepare('DELETE FROM otp WHERE email = ? OR expires < ?').run(email, new Date().toISOString())
	} catch (err) {
		res.status(500).send('Database error')
		console.error(err)
	}
}
