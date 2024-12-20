import type { Request, Response } from 'express'
import busboy from 'busboy'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'
import config from '../config'
import { getAVMetadata, nanoid } from '../utils'
import db from '../db'

interface FileInfo {
	filename: string
	encoding: string
	mimeType: string
}

// Upload files
export function postUpload(req: Request, res: Response) {
	const bb = busboy({
		headers: req.headers,
		limits: { fileSize: 1024 ** 3 }
	})

	bb.on('file', (_, file: Readable, info: FileInfo) => {
		if (!['image', 'audio', 'video'].some(type => info.mimeType.startsWith(type)))
			return res.status(400).send('File type not allowed')

		const data: Buffer[] = []

		file.on('data', chunk => data.push(chunk))

		file.on('end', async () => {
			try {
				const buffer = Buffer.concat(data)
				const id = nanoid()
				const filename = `${id}-${info.filename}`
				const uploadPath = path.join(config.uploadDir, filename)

				fs.writeFileSync(uploadPath, buffer)
				db.prepare('INSERT INTO uploads (id, owner, name, created) VALUES (?, ?, ?, ?)')
					.run(id, req.user.id, info.filename, new Date().toISOString())

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
