import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'

const dataDir = path.resolve(__dirname, '..', 'data')
const schemasDir = path.resolve(__dirname, 'schemas')
const dbPath = path.resolve(dataDir, 'db.sqlite')

if (!fs.existsSync(dataDir))
	fs.mkdirSync(dataDir, { recursive: true })

const db = Database(dbPath)

db.pragma('journal_mode = WAL')

fs.readdirSync(schemasDir)
	.filter(file => file.endsWith('.sql'))
	.forEach(file => {
		const schema = fs.readFileSync(path.join(schemasDir, file), 'utf-8')

		db.exec(schema)
	})

export default db
