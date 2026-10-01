import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { render } from './dist-ssr/entry-server.js'
import { SITE } from './site.config.js'

/**
 * The site's one hard promise is that the content is readable with the canvas
 * dead. A Vite SPA build ships an empty <div id="root">, which breaks that for
 * crawlers and for anyone without JS. This bakes the markup in at build time.
 */
const file = 'dist/index.html'
const html = readFileSync(file, 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error(`prerender: ${marker} not found in ${file}`)

let out = html.replace(marker, `<div id="root">${render()}</div>`)
out = out.replaceAll('__SITE__', SITE)

// Visit counts, off unless UMAMI_WEBSITE_ID is set in Netlify. The script and
// its beacon both go through /u/ (proxied in netlify.toml), so the browser
// still only ever talks to this origin and the CSP stays same-origin.
const umami = process.env.UMAMI_WEBSITE_ID
if (umami) {
  if (!/^[0-9a-f-]{36}$/i.test(umami)) throw new Error('prerender: UMAMI_WEBSITE_ID is not a uuid')
  out = out.replace('</head>',
    `<script defer src="/u/script.js" data-website-id="${umami}"></script></head>`)
}
writeFileSync(file, out)

// robots and sitemap are generated so the origin is never written twice
writeFileSync('dist/robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
writeFileSync('dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n`
  + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + `  <url><loc>${SITE}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n`
  + `</urlset>\n`)
rmSync('dist-ssr', { recursive: true, force: true })

const bytes = Buffer.byteLength(out)
if (!/Noise|carabiner/.test(out)) throw new Error('prerender: content missing from output')
if (out.includes('__SITE__')) throw new Error('prerender: unresolved __SITE__ placeholder')
console.log(`prerendered ${file} — ${(bytes / 1024).toFixed(1)} kB, origin ${SITE}`)
