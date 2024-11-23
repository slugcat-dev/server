import { type Request, type Response } from 'express'
import puppeteer from 'puppeteer-extra'
import stealth from 'puppeteer-extra-plugin-stealth'
import adblocker from 'puppeteer-extra-plugin-adblocker'
import { delay, isURL, userAgent } from '../utils'
import { env } from '../env'
import net from 'net'
import type { Page } from 'puppeteer'
import { ofetch } from 'ofetch'
import sharp from 'sharp'

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
	const icon = await getIcon(page)

	return page.evaluate(async ({ url, icon }) => {
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
			icon,
			description: getMeta('property="og:description"')
				?? getMeta('name="twitter:description"')
				?? getMeta('name="description"')
				?? undefined,
			image: getMeta('property="og:image"')
				?? getMeta('property="twitter:image"')
				?? undefined,
			url
		}
	}, { url, icon })
}

async function getIcon(page: Page) {
	const icons = await page.evaluate(async () => [
		...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel*="icon" i]'))
			.map(link => link.href)
			.filter(href => href.length),
		`${window.origin}/favicon.ico`
	])
	let closestSizeDiff = Infinity
	let bestIcon

	for (const url of icons) {
		try {
			const image = await ofetch(url, {
				responseType: 'arrayBuffer',
				headers: { 'User-Agent': userAgent }
			})

			try {
				const metadata = await sharp(image).metadata()

				if (metadata.width) {
					const sizeDiff = Math.abs(metadata.width - 64)

					if (sizeDiff < closestSizeDiff || (sizeDiff === closestSizeDiff && metadata.width > (bestIcon?.width ?? 0))) {
						bestIcon = { url, width: metadata.width }
						closestSizeDiff = sizeDiff
					}
				}
			} catch {
				if (url.endsWith('ico') && !bestIcon)
					bestIcon = { url, width: 16 }
			}
		} catch {}
	}

	return bestIcon?.url || undefined
}
