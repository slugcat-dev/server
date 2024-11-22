import { type Request, type Response } from 'express'
import puppeteer from 'puppeteer-extra'
import stealth from 'puppeteer-extra-plugin-stealth'
import adblocker from 'puppeteer-extra-plugin-adblocker'
import { delay, isURL, userAgent } from '../utils'
import { env } from '../env'
import net from 'net'
import type { Page } from 'puppeteer'

const browser = await puppeteer
	.use(stealth())
	.use(adblocker({ blockTrackers: true }))
	.launch({ headless: true })

// Get metadata for a link, like title, description and icon
export async function get(req: Request, res: Response) {
	const { url } = req.query

	if (!url || typeof url !== 'string' || !isURL(url))
		return res.status(400).send('URL required')

	const host = new URL(url).hostname

	if (env !== 'development' && (host === 'localhost' || net.isIP(host)))
		return res.status(403).send('URL not allowed')

	const page = await browser.newPage()

	try {
		await page.setUserAgent(userAgent)
		await page.setViewport({ width: 800, height: 600 })
		await page.setRequestInterception(true)

		// Speed up page loading
		page.on('request', req => {
			if (['font', 'image', 'media', 'stylesheet'].includes(req.resourceType()))
				return req.abort()

			req.continue()
		})

		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })
		await delay(1000)

		const metadata = await getMetadata(url, page)

		res.json(metadata)
	} catch (err) {
		res.status(500).send('Error processing link')
		console.error(err)
	}

	await page.close()
}

async function getMetadata(url: string, page: Page) {
	return page.evaluate(async (url: string) => {
		function getMeta(query: string) {
			const meta = document.querySelector<HTMLMetaElement>(`meta[${query} i]`)

			if (meta && meta.content.length)
				return meta.content

			return null
		}

		return {
			title: getMeta('property="og:title"')
				?? getMeta('name="twitter:title"')
				?? (document.title || undefined),
			siteName: getMeta('property="og:site_name"') ?? undefined,
			description: getMeta('property="og:description"')
				?? getMeta('name="twitter:description"')
				?? getMeta('name="description"')
				?? undefined,
			image: getMeta('property="og:image"')
				?? getMeta('property="twitter:image"')
				?? undefined,
			url
		}
	}, url)
}
