import type { Request, Response } from 'express'
import { createTransport } from 'nodemailer'
import config from '../../config'
import crypto from 'crypto'
import db from '../../db'
import path from 'path'
import fs from 'fs'

const transporter = createTransport({
	host: config.mail.server,
	secure: true,
	auth: {
		user: config.mail.user,
		pass: config.mail.pass
	}
})

export function postSendOTP(req: Request, res: Response) {
	const { email } = req.body

	if (!email)
		return void res.status(400).send('Email required')

	const otp = crypto.randomBytes(3).toString('hex').toUpperCase()
	const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()
	const query = `
		INSERT INTO otp (email, otp, expires)
		VALUES (?, ?, ?)
		ON CONFLICT(email) DO UPDATE SET otp = excluded.otp, expires = excluded.expires
	`

	db.run(query, [email, otp, expires], async err => {
		if (err) {
			res.status(500).send('Database error')
			console.error(err)

			return
		}

		try {
			const mailPath = path.join(__dirname, '../..', 'assets', 'otp-email.html')
			const mail = fs.readFileSync(mailPath, 'utf-8')

			await transporter.sendMail({
				from: config.mail.from,
				to: email,
				subject: 'Login Code',
				text: `Your login code is "${otp}". Enter the code in the app to log in. This code will expire in 10 minutes. If you didn't request a login code, you can ignore this email.`,
				html: mail.replaceAll('{{ otp }}', otp)
			})

			res.sendStatus(204)
		} catch (err) {
			res.status(500).send('Error sending email')
			console.error(err)
		}
	})
}
