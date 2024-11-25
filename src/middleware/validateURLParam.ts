import type { NextFunction, Request, Response } from 'express'
import { isURL } from '../utils'
import config from '../config'
import net from 'net'

export default function validateURLParam(req: Request, res: Response, next: NextFunction) {
	// Check if the URL param is present
	const url = req.query.url

	if (!url || typeof url !== 'string' || !isURL(url)) {
		res.status(400).send('URL required')

		return
	}

	// Disallow localhost and IP addresses
	const host = new URL(url).hostname.replace(/\[|\]/g, '')

	if (!config.dev && (host === 'localhost' || net.isIP(host))) {
		res.status(403).send('URL not allowed')

		return
	}

	next()
}
