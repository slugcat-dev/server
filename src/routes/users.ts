import type { Request, Response } from 'express'
import db from '../db'

export function getMe(req: Request, res: Response) {
	res.send(req.user)
}

export function getBoards(req: Request, res: Response) {
	res.json(db.prepare('SELECT * FROM boards WHERE owner = ?').all(req.user.id) as BoardRecord[])
}

export function getUploads(req: Request, res: Response) {
	res.json(db.prepare('SELECT * FROM uploads WHERE owner = ?').all(req.user.id) as UploadRecord[])
}
