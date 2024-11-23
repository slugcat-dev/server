import { validateURLParam } from '../middleware/validateURLParam'
import { type Request, type Response } from 'express'
import { userAgent } from '../utils'
import { FetchError, ofetch } from 'ofetch'
import sharp from 'sharp'

// Get the content type of a link
export const get = [
	validateURLParam,
	async (req: Request, res: Response) => {
		try {
			const url = req.query.url as string
			let headReq = { headers: {
					get: (name: string) => null as string | null
			} }

			// Gracefully test if the URL is reachable
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
				// Include image size in the response
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
]
