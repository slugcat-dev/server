import type { Request, Response } from 'express'
import busboy from 'busboy'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'
import { uploadDir } from '../env'
import { getAVMetadata } from '../utils'

interface FileInfo {
	filename: string
	encoding: string
	mimeType: string
}

// Upload files
export async function post(req: Request, res: Response) {
	const bb = busboy({
		headers: req.headers,
		limits: { fileSize: 1024 ** 3 }
	})

	bb.on('file', async (_, file: Readable, info: FileInfo) => {
		if (!['image', 'audio', 'video'].some(type => info.mimeType.startsWith(type)))
			return res.status(400).send('File type not allowed')

		const data: Buffer[] = []

		file.on('data', chunk => data.push(chunk))

		file.on('end', async () => {
			try {
				const buffer = Buffer.concat(data)
				const filename = `${Date.now()}-${info.filename}`
				const uploadPath = path.join(uploadDir, filename)

				fs.writeFileSync(uploadPath, buffer)

				if (info.mimeType.startsWith('audio')) {
					let metadata

					try {
						metadata = await getAVMetadata(uploadPath)
					} catch {}

					return res.json({
						name: info.filename,
						filename,
						title: metadata?.tags?.title ?? info.filename
					})
				}

				res.json({ name: info.filename, filename })
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
