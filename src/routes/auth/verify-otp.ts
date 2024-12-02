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

			if (users.count)
				db.prepare('INSERT INTO users (email, created) VALUES (?, ?)').run(email, new Date().toISOString())
			else
				db.prepare('INSERT INTO users (id, email, created) VALUES (?, ?, ?)').run(125020, email, new Date().toISOString())

			user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as UserRecord
		}

		const token = jwt.sign({ uid: user.id }, config.jwtSecret, { expiresIn: '30d' })

		res.json({ token })
		db.prepare('DELETE FROM otp WHERE email = ? OR expires < ?').run(email, new Date().toISOString())
	} catch (err) {
		res.status(500).send('Database error')
		console.error(err)
	}
}
