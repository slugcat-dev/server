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

interface User {
	email: string
}

declare namespace Express {
	export interface Request {
		 user?: User
	}
}
