import type { Request, Response } from 'express'
import db from '../../db'
import jwt from 'jsonwebtoken'
import config from '../../config'

export function postVerifyOTP(req: Request, res: Response) {
	const { email, otp } = req.body

	if (!email || !otp)
		return void res.status(400).send('Email and OTP required')

	const query = 'SELECT * FROM otp WHERE email = ?'

	db.get<OTPRecord>(query, [email], (err, row) => {
		if (err) {
			res.status(500).send('Database error')
			console.error(err)

			return
		}

		if (!row)
			return void res.status(404).send('Email not found')

		if (otp !== row.otp || new Date(row.expires) < new Date())
			return void res.status(403).send('Invalid OTP')

		const token = jwt.sign({ email }, config.jwtSecret, { expiresIn: '30d' })

		res.json({ token })
		db.run('DELETE FROM otp WHERE email = ? OR expires < ?', [email, new Date().toISOString()])
	})
}
