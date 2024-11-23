import { type Request, type Response } from 'express'
import { isURL, userAgent } from '../utils'
import net from 'net'
import { env } from '../env'
import { FetchError, ofetch } from 'ofetch'
import sharp from 'sharp'

// Get the content type of a link
export async function get(req: Request, res: Response) {
	const { url } = req.query

	if (!url || typeof url !== 'string' || !isURL(url))
		return res.status(400).send('URL required')

	const host = new URL(url).hostname.replace(/\[|\]/g, '')

	if (env !== 'development' && (host === 'localhost' || net.isIP(host)))
		return res.status(403).send('URL not allowed')

	try {
		let headReq = { headers: {
				get: (name: string) => null as string | null
		} }

		try {
			headReq = await ofetch.raw(url, {
				method: 'HEAD',
				headers: { 'User-Agent': userAgent }
			})
		} catch (err) {
			if (!(err instanceof FetchError && err.statusCode && err.statusCode >= 400))
				throw err
		}

		const contentType = headReq.headers.get('content-type') ?? ''

		if (contentType.startsWith('image')) {
			const image = await ofetch(url, {
				responseType: 'arrayBuffer',
				headers: { 'User-Agent': userAgent }
			})
			const metadata = await sharp(image).metadata()

			return res.json({
				type: 'image',
				width: metadata.width,
				height: metadata.height
			})
		} else if (/audio|video|pdf/.test(contentType))
			return res.json({ type: /pdf/.test(contentType) ? 'pdf' : contentType.split('/')[0] })

		return res.json({ type: 'link' })
	} catch (err) {
		res.status(500).send('Error processing link')
		console.error(err)
	}
}
