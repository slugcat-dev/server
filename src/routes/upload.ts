import type { Request, Response } from 'express'
import busboy from 'busboy'
import { Readable } from 'stream'
import fs from 'fs'
import sharp from 'sharp'
import path from 'path'

interface FileInfo {
	filename: string
	encoding: string
	mimeType: string
}

const uploadDir = process.env.SERVER_UPLOAD_DIR!

// Upload files
export async function post(req: Request, res: Response) {
	const bb = busboy({ headers: req.headers })

	bb.on('file', async (_, file: Readable, info: FileInfo) => {
		if (['image'].includes(info.mimeType))
			return res.status(400).send('File type not allowed')

		const data: Buffer[] = []

		file.on('data', chunk => data.push(chunk))

		file.on('end', async () => {
			try {
				const buffer = Buffer.concat(data)
				const filename = `${Date.now()}-${info.filename}`

				// Test if the uploaded file is really an image
				await sharp(buffer).metadata()

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
