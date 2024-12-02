import type { Request, Response } from 'express'
import { ofetch } from 'ofetch'
import { userAgent } from '../utils'

export async function getProxy(req: Request, res: Response) {
	const url = req.query.url as string

	try {
		const dataReq = await ofetch.raw(url, {
			headers: { 'User-Agent': userAgent },
			responseType: 'arrayBuffer'
		})
		const contentType = dataReq.headers.get('content-type') ?? ''

		if (dataReq._data)
			res.type(contentType).send(Buffer.from(dataReq._data))
		else
			res.status(204).send()
	} catch (err) {
		res.status(500).send('Error fetching URL')
		console.error(err)
	}
}
