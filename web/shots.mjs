/**
 * Screenshot every section at a chosen viewport, driving the installed Chrome.
 * The preview surfaces available during development blank out on scroll, and
 * headless Chrome without a GL backend silently falls back to the no-WebGL
 * path — so both need to be forced here or you end up auditing the wrong page.
 *
 *   npm run shots            # 375x812
 *   npm run shots -- 1440 900
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const [w = 375, h = 812] = process.argv.slice(2).map(Number)
const URL = process.env.URL || 'http://localhost:5180/'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  // without a GL backend the app correctly skips the canvas, and you audit
  // the fallback instead of the experience
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: w, height: h, deviceScaleFactor: 2,
  isMobile: w < 820, hasTouch: w < 820 })
await page.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 6000))

if (!(await page.evaluate(() => !!document.querySelector('canvas'))))
  console.warn('! no canvas — auditing the no-WebGL fallback, not the scene')

for (const sec of await page.$$eval('[data-sec]', (e) => e.map((n) => n.dataset.sec))) {
  await page.evaluate((n) => {
    const el = document.querySelector(`[data-sec="${n}"]`)
    window.scrollTo(0, el.offsetTop + el.offsetHeight / 2 - innerHeight / 2)
  }, sec)
  await new Promise((r) => setTimeout(r, 1800))
  await page.screenshot({ path: `shots/${w}-${sec}.png` })
  const bad = await page.evaluate(() => {
    const vw = innerWidth
    return [...document.querySelectorAll('main *, header *')]
      .filter((e) => !e.children.length && e.textContent.trim())
      .filter((e) => { const r = e.getBoundingClientRect()
        return r.width > 0 && (r.right > vw + 1 || r.left < -1) })
      .map((e) => (e.className || e.tagName) + ': ' + e.textContent.trim().slice(0, 24))
  })
  console.log(`${sec.padEnd(12)} ${bad.length ? 'CLIPPED ' + bad.join(' | ') : 'ok'}`)
}
await browser.close()
