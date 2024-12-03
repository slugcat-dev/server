import type { Request, Response } from 'express'

export function getMe(req: Request, res: Response) {
	res.send(req.user)
}
