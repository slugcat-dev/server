import type { Request, Response } from 'express'

export default function getIndex(req: Request, res: Response) {
	res.send('API Server')
}
