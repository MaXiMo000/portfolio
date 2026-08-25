/**
 * Verifies the built site actually contains what the page promises.
 *
 * Run: npm run check   (after npm run build)
 *
 * This exists because two project sections shipped with no link to the project
 * at all -- recur and AI-Recipe-Maker, both public repos, both unreachable from
 * the site for as long as that was true. The CI check at the time grepped
 * dist/index.html for the strings 'carabiner' and 'Noise', which a page missing
 * half its links passes comfortably.
 *
 * Everything is asserted against the PRERENDERED html, so it also proves the
 * page is readable with no JavaScript.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const failures = []
const ok = (label, cond) => { if (!cond) failures.push(label) }

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html does not exist -- the build did not run')
  process.exit(1)
}
const html = readFileSync(join(DIST, 'index.html'), 'utf8')

// Prerendered, not an empty shell waiting on JS.
ok('index.html is substantial (>4kB)', html.length > 4096)
ok('the headline is in the markup', html.includes('Noise'))
ok('the lede is in the markup', html.includes('refuse to guess'))

// Every section the rail links to must exist, or the nav points at nothing.
const RAIL = ['Resolve', 'carabiner', 'recur', 'LabLedger', 'QuizNest', 'Recipe', 'Contact']
RAIL.forEach((name, i) => {
  ok(`section #s${i} (${name}) exists`, html.includes(`id="s${i}"`))
  ok(`rail links to #s${i}`, html.includes(`href="#s${i}"`))
})

// Every project must be reachable. This is the check that would have caught
// recur and AI-Recipe-Maker shipping with no link.
const DESTINATIONS = [
  'github.com/MaXiMo000/carabiner',
  'github.com/MaXiMo000/recur',
  'github.com/MaXiMo000/AI-Recipe-Maker',
  'labledger-web.onrender.com',
  'quiz-app-cp2h.onrender.com',
]
for (const url of DESTINATIONS) ok(`reachable: ${url}`, html.includes(url))

// Every project section must carry its own outbound link. Counting links
// across the whole page would let one section hold two while another holds
// none, which is precisely the shape of the bug this is here to prevent -- so
// each section is inspected on its own.
const PROJECTS = ['carabiner', 'recur', 'labledger', 'quiznest', 'recipe']
for (const sec of PROJECTS) {
  const start = html.indexOf(`data-sec="${sec}"`)
  const rest = start === -1 ? '' : html.slice(start)
  const end = rest.indexOf('</section>')
  const body = end === -1 ? rest : rest.slice(0, end)
  ok(`section ${sec} exists`, start !== -1)
  ok(`section ${sec} links somewhere`, /class="go\b/.test(body))
}

// No two links may announce the same thing.
//
// Three links read "Open the repo →" and two read "See it live →". Visually
// the surrounding section says which project; to a screen reader pulling up a
// list of links they are indistinguishable, which is WCAG 2.4.4. aria-label
// gives each one a destination you can tell apart, and this keeps it that way.
const accessibleNames = []
for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
  const aria = /aria-label="([^"]*)"/.exec(m[1])
  const name = aria ? aria[1] : m[2].replace(/<[^>]+>/g, '').trim()
  if (name) accessibleNames.push(name)
}
const seen = new Map()
for (const n of accessibleNames) seen.set(n, (seen.get(n) || 0) + 1)
const ambiguous = [...seen].filter(([, c]) => c > 1).map(([n]) => n)
ok(`every link has a distinct accessible name${ambiguous.length ? ` (repeated: ${ambiguous.join(', ')})` : ''}`,
   ambiguous.length === 0)

// Contact routes somewhere.
ok('email link present', html.includes('mailto:'))
ok('CV is linked and shipped', html.includes('ritish-saini-cv.pdf')
   && existsSync(join(DIST, 'ritish-saini-cv.pdf')))

// The security headers are a deploy artefact; if _headers stops being copied,
// the site silently loses its CSP and nothing else notices.
const headers = existsSync(join(DIST, '_headers'))
  ? readFileSync(join(DIST, '_headers'), 'utf8') : ''
ok('_headers shipped', headers.length > 0)
ok('CSP present', headers.includes('Content-Security-Policy'))
ok('CSP still default-src none', headers.includes("default-src 'none'"))
ok('HSTS present', headers.includes('Strict-Transport-Security'))
ok('frame-ancestors locked', headers.includes("frame-ancestors 'none'"))

// Source maps expose the unminified tree to anyone who asks.
const maps = readdirSync(join(DIST, 'assets')).filter(f => f.endsWith('.map'))
ok(`no source maps published (found ${maps.length})`, maps.length === 0)

if (failures.length) {
  console.error(`FAIL (${failures.length})`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`ok  (build verified: ${RAIL.length} sections, ${DESTINATIONS.length} destinations)`)
