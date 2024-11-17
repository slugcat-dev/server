import { type Request, type Response } from 'express'
import puppeteer from 'puppeteer-extra'
import stealth from 'puppeteer-extra-plugin-stealth'
import adblocker from 'puppeteer-extra-plugin-adblocker'
import { isURL } from '../utils'
import type { Page } from 'puppeteer'

const browser = await puppeteer
	.use(stealth())
	.use(adblocker({ blockTrackers: true }))
	.launch({ headless: true })

export async function get(req: Request, res: Response) {
	const { url } = req.query

	if (!url || typeof url !== 'string' || !isURL(url))
		return res.status(400).send('URL required')

	const page = await browser.newPage()

	try {
		await page.setViewport({ width: 800, height: 600 })
		await page.setRequestInterception(true)

		page.on('request', req => {
			if (['font', 'image', 'media', 'stylesheet'].includes(req.resourceType()))
				return req.abort()

			req.continue()
		})

		await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 })

		const metadata = await getMetadata(url, page)

		res.json(metadata)
	} catch (err) {
		res.status(500).json('Error processing link')
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
