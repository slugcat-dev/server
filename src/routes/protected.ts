import type { Request, Response } from 'express'

export default function getProtected(req: Request, res: Response) {
	res.json(req.user)
}
