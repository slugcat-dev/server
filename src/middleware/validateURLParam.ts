import type { NextFunction, Request, Response } from 'express'
import { isURL } from '../utils'
import { env } from '../env'
import net from 'net'

export function validateURLParam(req: Request, res: Response, next: NextFunction) {
	const url = req.query.url

	if (!url || typeof url !== 'string' || !isURL(url))
		return res.status(400).send('URL required')

	const host = new URL(url).hostname.replace(/\[|\]/g, '')

	if (env !== 'development' && (host === 'localhost' || net.isIP(host)))
		return res.status(403).send('URL not allowed')

	next()
}
