interface OTPRecord {
	email: string
	otp: string
	expires: string
}

interface UserRecord {
	id: number
	email: string
	created: string
}

declare namespace Express {
	export interface Request {
		 user?: UserRecord
	}
}
