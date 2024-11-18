export const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

/**
 * Check if a string is an URL.
 */
export function isURL(string: string) {
	try {
		return new URL(string)
	} catch {}

	return false
}
