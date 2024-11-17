import type { Request, Response } from 'express'

export async function get(req: Request, res: Response) {
	res.send('API Server')
}
