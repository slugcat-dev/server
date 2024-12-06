import type { Request, Response } from 'express'
import db from '../db'

export function getBoard(req: Request, res: Response) {
	const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id) as BoardRecord | undefined
	const cards = db.prepare('SELECT * FROM cards WHERE board = ?').all(req.params.id) as CardRecord[]

	if (!board)
		return void res.status(404).send('Board not found')

	res.json({
		...board,
		cards: cards.map(card => ({
			id: card.id,
			type: card.type,
			pos: { x: card.x, y: card.y },
			content: JSON.parse(card.content),
			created: card.created,
			modified: card.modified
		}))
	})
}

export function postSync(req: Request, res: Response) {
	const queue = req.body

	// Board operations
	for (const operation of queue.boards) {
		switch (operation.type) {
			// Create board
			case 'create': {
				db.prepare('INSERT INTO boards (id, owner, name, created, modified) VALUES (?, ?, ?, ?, ?)')
					.run(operation.board.id, req.user.id, operation.board.name, operation.board.created, operation.board.created)

				break
			}

			// Update board
			case 'update': {
				const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(operation.board.id) as BoardRecord | undefined

				if (!board)
					continue

				db.prepare('UPDATE boards SET name = ?, modified = ? WHERE id = ?')
					.run(operation.board.name, operation.board.modified, operation.board.id)

				break
			}

			// Delete board
			case 'delete': {
				const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(operation.board.id) as BoardRecord | undefined

				// Only the owner can delete a board
				if (!board || board.owner !== req.user.id)
					continue

				db.prepare('DELETE FROM boards WHERE id = ?').run(operation.board.id)

				break
			}
		}
	}

	// Card operations
	for (const operation of queue.cards) {
		const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(operation.board) as BoardRecord | undefined

		if (!board)
			continue

		db.prepare('UPDATE boards SET modified = ? WHERE id = ?').run(operation.card.modified, board.id)

		switch (operation.type) {
			// Create card
			case 'create': {
				db.prepare('INSERT INTO cards (id, board, type, x, y, content, created, modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
					.run(
						operation.card.id,
						operation.board,
						operation.card.type,
						operation.card.pos.x,
						operation.card.pos.y,
						JSON.stringify(operation.card.content),
						new Date(operation.card.created).toISOString(),
						new Date(operation.card.modified).toISOString()
					)

				break
			}

			// Update card
			case 'update': {
				const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(operation.card.id) as CardRecord | undefined

				if (!card)
					continue

				db.prepare('UPDATE cards SET x = ?, y = ?, content = ?, modified = ? WHERE id = ?')
					.run(
						operation.card.pos.x ?? card.x,
						operation.card.pos.y ?? card.y,
						operation.card.content ? JSON.stringify(operation.card.content) : card.content,
						new Date(operation.card.modified).toISOString(),
						operation.card.id
					)

				break
			}

			// Delete card
			case 'delete': {
				const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(operation.card.id) as CardRecord | undefined

				if (!card)
					continue

				db.prepare('DELETE FROM cards WHERE id = ?').run(operation.card.id)

				break
			}
		}
	}

	res.sendStatus(200)
}
