import { validateURLParam } from '../middleware/validateURLParam'
import type { Request, Response } from 'express'
import { userAgent } from '../utils'
import { ofetch } from 'ofetch'
import sharp from 'sharp'

// Generate a low quality image placeholder (LQIP)
export const get = [
	validateURLParam,
	async (req: Request, res: Response) => {
		try {
			const url = req.query.url as string
			const image = await ofetch(url, {
				responseType: 'arrayBuffer',
				headers: { 'User-Agent': userAgent }
			})
			const lqipBuffer = await sharp(image)
				.blur(2)
				.resize(20)
				.avif({ quality: 75 })
				.toBuffer()

			res.set('Content-Type', 'image/avif')
			res.send(lqipBuffer)
		} catch (err) {
			res.status(500).send('Error processing image')
			console.error(err)
		}
	}
]
