import { type Request, type Response } from 'express'
import { isURL, userAgent } from '../utils'
import { ofetch } from 'ofetch'
import sharp from 'sharp'

// Get the content type of a link
export async function get(req: Request, res: Response) {
	const { url } = req.query

	if (!url || typeof url !== 'string' || !isURL(url))
		return res.status(400).send('URL required')

	try {
		const headReq = await ofetch.raw(url, {
			method: 'HEAD',
			headers: { 'User-Agent': userAgent }
		})
		const contentType = headReq.headers.get('content-type') ?? ''

		if (contentType.startsWith('image')) {
			const image = await ofetch(url, { responseType: 'arrayBuffer' })
			const metadata = await sharp(image).metadata()

			return res.json({
				type: 'image',
				width: metadata.width,
				height: metadata.height
			})
		}

		return res.json({ type: 'link' })
	} catch (err) {
		res.status(500).json('Error processing link')
		console.error(err)
	}
}
