import type { NextFunction, Request, Response } from 'express'
import { isURL } from '../utils'
import config from '../config'
import net from 'net'

export function validateURLParam(req: Request, res: Response, next: NextFunction) {
	const url = req.query.url

	if (!url || typeof url !== 'string' || !isURL(url))
		return void res.status(400).send('URL required')

	// Disallow localhost and IP addresses
	const host = new URL(url).hostname.replace(/\[|\]/g, '')

	if (!config.dev && (host === 'localhost' || net.isIP(host)))
		return void res.status(403).send('URL not allowed')

	next()
}
