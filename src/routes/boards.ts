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
	const failed = {
		boards: [] as any[],
		cards: [] as any[]
	}

	// Board operations
	for (const operation of queue.boards) {
		try {
			const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(operation.board.id) as BoardRecord | undefined

			switch (operation.type) {
				// Create board
				case 'create': {
					if (board) {
						failed.boards.push({
							operation,
							reason: 'Board already exists'
						})

						continue
					}

					db.prepare('INSERT INTO boards (id, owner, name, created, modified) VALUES (?, ?, ?, ?, ?)')
						.run(operation.board.id, req.user.id, operation.board.name, new Date(operation.board.created).toISOString(), new Date(operation.board.modified).toISOString())

					break
				}

				// Update board
				case 'update': {
					if (!board) {
						failed.boards.push({
							operation,
							reason: 'Board not found'
						})

						continue
					}

					db.prepare('UPDATE boards SET name = ?, modified = ? WHERE id = ?')
						.run(operation.board.name, new Date(operation.board.modified).toISOString(), operation.board.id)

					break
				}

				// Delete board
				case 'delete': {
					if (!board) {
						failed.boards.push({
							operation,
							reason: 'Board not found'
						})

						continue
					}

					// Only the owner can delete a board
					if (board.owner !== req.user.id) {
						failed.boards.push({
							operation,
							reason: 'Not allowed'
						})

						continue
					}

					db.prepare('DELETE FROM boards WHERE id = ?').run(operation.board.id)

					break
				}
			}
		} catch (err) {
			console.error(err)
			failed.boards.push({
				operation,
				reason: 'Database error'
			})
		}
	}

	// Card operations
	for (const operation of queue.cards) {
		try {
			const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(operation.board) as BoardRecord | undefined
			const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(operation.card.id) as CardRecord | undefined

			if (!board) {
				failed.cards.push({
					operation,
					reason: 'Board not found'
				})

				continue
			}

			db.prepare('UPDATE boards SET modified = ? WHERE id = ?').run(new Date(operation.card.modified).toISOString(), board.id)

			switch (operation.type) {
				// Create card
				case 'create': {
					if (card) {
						failed.cards.push({
							operation,
							reason: 'Card already exists'
						})

						continue
					}

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
					if (!card) {
						failed.cards.push({
							operation,
							reason: 'Card not found'
						})

						continue
					}

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
					if (!card) {
						failed.cards.push({
							operation,
							reason: 'Card not found'
						})

						continue
					}

					db.prepare('DELETE FROM cards WHERE id = ?').run(operation.card.id)

					break
				}
			}
		} catch (err) {
			console.error(err)
			failed.cards.push({
				operation,
				reason: 'Database error'
			})
		}
	}

	res.json(failed)
}
