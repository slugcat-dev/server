interface User {
	email: string
}

declare namespace Express {
	export interface Request {
		 user?: User
	}
}
