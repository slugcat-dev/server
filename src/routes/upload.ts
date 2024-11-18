import type { Request, Response } from 'express'
import busboy from 'busboy'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'

interface FileInfo {
	filename: string
	encoding: string
	mimeType: string
}

const uploadDir = process.env.SERVER_UPLOAD_DIR!

export async function post(req: Request, res: Response) {
	const bb = busboy({ headers: req.headers })

	bb.on('file', async (_, file: Readable, info: FileInfo) => {
		if (!info.mimeType.startsWith('image'))
			return res.status(400).send('Only images are allowed')

		const data: Buffer[] = []

		file.on('data', chunk => data.push(chunk))

		file.on('end', async () => {
			try {
				const buffer = Buffer.concat(data)
				const filename = `${Date.now()}-${info.filename}`

				fs.writeFileSync(path.join(uploadDir, filename), buffer)
				res.send(filename)
			} catch (err) {
				res.status(500).send('Error uploading file')
				console.error(err)
			}
		})

		file.on('error', (err: Error) => {
			res.status(500).send('Error uploading file')
			console.error(err)
		})
	})

	req.pipe(bb)
}
