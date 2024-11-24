import ffmpeg from 'fluent-ffmpeg'

export const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

export function delay(time: number) {
	return new Promise(reolve => setTimeout(reolve, time))
}

/**
 * Check if a string is an URL.
 */
export function isURL(string: string) {
	try {
		return new URL(string)
	} catch {}

	return false
}

/**
 * Get metadata of an audio or video file.
 */
export async function getAVMetadata(file: string) {
	return new Promise<ffmpeg.FfprobeData['format']>((resolve, reject) => {
		ffmpeg.ffprobe(file, (err, data) => {
			if (err)
				reject(err)

			resolve(data.format)
		})
	})
}
