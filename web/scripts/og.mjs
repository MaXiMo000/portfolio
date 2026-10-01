/** Renders og.html to public/og.png at 1200x630. */
import puppeteer from 'puppeteer-core'
import { pathToFileURL } from 'node:url'
import { CHROME } from './chrome.mjs'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630 })
await page.goto(pathToFileURL('og.html').href, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og.png' })
await browser.close()
console.log('wrote public/og.png')
