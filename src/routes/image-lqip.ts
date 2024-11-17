import type { Request, Response } from 'express'
import { ofetch } from 'ofetch'
import sharp from 'sharp'

// Generate a low quality image placeholder (LQIP)
export async function get(req: Request, res: Response) {
	const { url } = req.query

	if (!url || typeof url !== 'string')
		return res.status(400).send('Image URL required')

	try {
		const image = await ofetch(url, { responseType: 'arrayBuffer' })
		const lqipBuffer = await sharp(image)
			.blur(2)
			.resize(20)
			.avif({ quality: 75 })
			.toBuffer()

		res.set('Content-Type', 'image/avif')
		res.send(lqipBuffer)
	} catch {
		res.status(500).send('Error processing image')
	}
}
