interface OTPRecord {
	email: string
	otp: string
	expires: string
}

interface UserRecord {
	id: string
	email: string
	created: string
}

interface BoardRecord {
	id: string
	owner: string
	name: string
	created: string
	modified: string
}

interface CardRecord {
	id: string
	board: string
	type: string
	x: number
	y: number
	content: any
	created: string
	modified: string
}

interface UploadRecord {
	id: string
	owner: string
	name: string
	created: string
	modified: string
}

declare namespace Express {
	export interface Request {
		 user: UserRecord
	}
}
