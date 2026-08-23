import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { render } from './dist-ssr/entry-server.js'

/**
 * The site's one hard promise is that the content is readable with the canvas
 * dead. A Vite SPA build ships an empty <div id="root">, which breaks that for
 * crawlers and for anyone without JS. This bakes the markup in at build time.
 */
const file = 'dist/index.html'
const html = readFileSync(file, 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error(`prerender: ${marker} not found in ${file}`)

const out = html.replace(marker, `<div id="root">${render()}</div>`)
writeFileSync(file, out)
rmSync('dist-ssr', { recursive: true, force: true })

const bytes = Buffer.byteLength(out)
if (!/Noise|carabiner/.test(out)) throw new Error('prerender: content missing from output')
console.log(`prerendered ${file} — ${(bytes / 1024).toFixed(1)} kB with content`)
