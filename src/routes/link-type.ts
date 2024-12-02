import { type Request, type Response } from 'express'
import { FetchError, ofetch } from 'ofetch'
import { getAVMetadata, userAgent } from '../utils'
import sharp from 'sharp'

// Get the content type of a link
export async function getLinkType(req: Request, res: Response) {
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
			const image = await ofetch(url, {
				responseType: 'arrayBuffer',
				headers: { 'User-Agent': userAgent }
			})
			const metadata = await sharp(image).metadata()

			return void res.json({
				type: 'image',
				width: metadata.width,
				height: metadata.height
			})
		}

		if (contentType.startsWith('audio')) {
			const filename = new URL(url).pathname.split('/').pop()
			let metadata

			try {
				metadata = await getAVMetadata(url)
			} catch {}

			return void res.json({
				type: contentType.split('/')[0],
				title: metadata?.tags?.title ?? filename
			})
		}

		if (contentType.startsWith('video'))
			return void res.json({ type: 'video' })

		res.json({ type: 'link' })
	} catch (err) {
		res.status(500).send('Error processing link')
		console.error(err)
	}
}
