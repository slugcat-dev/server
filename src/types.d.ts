interface OTPRecord {
	email: string
	otp: string
	expires: string
}

interface User {
	email: string
}

declare namespace Express {
	export interface Request {
		 user?: User
	}
}
