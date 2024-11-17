/**
 * Check if a string is an URL.
 */
export function isURL(string: string) {
	try {
		return new URL(string)
	} catch {}

	return false
}
