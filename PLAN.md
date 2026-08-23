# Portfolio — full plan

Read `HANDOFF.md` first. This is the detail.

---

## 1. The single sentence

**An awwwards-grade portfolio that loads like a text file.**

Every decision below resolves against that. When "impressive" and "fast" appear
to conflict, fast wins and the impressive part gets moved later in the load
order — never cut, never blocking.

---

## 2. What is being shown

Real, deployed work. This is the strongest thing Ritish has and most portfolios
do not have it: **four of these are clickable right now.**

| Project | What it actually is | Live |
|---|---|---|
| **carabiner** | Repo security scanner. Ratchet baseline, adversarial "drill", SARIF. On PyPI (`carabiner-sec`), GHCR, GitHub Marketplace. Calibrated against 60 public repos. 57 tests. | [site](https://maximo000.github.io/carabiner/) · [repo](https://github.com/MaXiMo000/carabiner) |
| **recur** | Bank CSV in, recurring-charge truth out. Postgres **row-level security** for tenant isolation, argon2id, OAuth 2.1 + PKCE remote MCP server. No bank credentials, ever. | repo |
| **LabLedger** | Lab PDF in; resolves each test to a **LOINC code**, converts units, resolves reference intervals, charts trends. Anything uncertain goes to a human. | [live](https://labledger-web.onrender.com/) |
| **QuizNest** | MERN, AI-generated quizzes, analytics, gamification. | [live](https://quiz-app-cp2h.onrender.com/) |
| **AI-Recipe-Maker** | TypeScript, Claude-powered recipe generation, nutrition analysis, meal plans. | repo |
| **HouseofBooks** | MERN bookstore. | [live](https://houseofbooksfrontend.onrender.com/) |

**Lead with carabiner, recur and LabLedger.** They are the three with a real
technical thesis. The others are supporting evidence of range, not headliners.

Each project card must answer, in this order: *what problem, what was hard,
what did it cost.* Not a stack list. "Postgres RLS so a query that forgets its
tenant filter returns zero rows" beats "React, Node, MongoDB" every time.

---

## 3. Design direction

### Do not ship the default

AI-generated and template portfolios cluster hard around three looks. Avoid all
three unless there is a specific reason:

1. Near-black background, one acid-green or violet accent, glassmorphic cards
2. Cream `#F4F1EA` ground, high-contrast serif display, terracotta accent
3. Purple-to-blue gradient hero with floating blurred blobs

### The direction to take instead

**Instrument panel.** Ritish's work is measurement: query plans, LOINC codes,
tenant isolation proofs, 60-repo corpora, entropy thresholds. The visual
language should be the language of instruments — precise, legible, quietly
confident, numbers treated as first-class content.

- **Palette** — a near-neutral technical ground (graphite / bone), one
  signal colour used *only* for live data and interactive state, one warning
  colour used almost never. Four to six tokens, all named. No gradient meshes.
- **Type** — a characteristic display face with real width contrast, a
  workhorse body face, and a genuine mono for every number and identifier.
  Numbers are the content here; set them properly, tabular figures on.
- **Structure** — numbers and units carry meaning: `2,441 KB`, `31 → 2`,
  `0.02s`, `57 tests`. Let real figures do the decorating instead of ornament.
- **Signature** — one memorable element, executed well. Not five effects.

### Motion

Motion must serve comprehension. A scroll-triggered reveal that shows a plan
changing, or a ratchet that turns one way, teaches something. A parallax card
tilt teaches nothing and costs a repaint.

Every animation respects `prefers-reduced-motion: reduce` — completely, not by
shortening durations.

---

## 4. Performance budget — the hard part, and the differentiator

These are pass/fail, checked in CI. Not aspirations.

| Metric | Budget | Reference site for contrast |
|---|---|---|
| HTML + critical CSS, first paint | **≤ 50 KB** | — |
| Total transfer, first view, no 3D | **≤ 200 KB** | 2,441 KB |
| JavaScript, first view | **≤ 40 KB** | 231 KB |
| Largest Contentful Paint (mobile, throttled) | **≤ 1.5 s** | — |
| Cumulative Layout Shift | **0** | — |
| Lighthouse performance (mobile) | **≥ 95** | — |
| Time to interactive without any JS | **immediate** | never |

**No preloader. Ever.** A loading screen is an admission that the page cannot
show anything useful yet. Text and layout are HTML; they arrive with the
document.

### How the budget is actually met

- **Server-rendered static HTML.** Content is in the markup, not built by JS.
  The site is fully readable and navigable with JavaScript disabled.
- **Self-host everything.** No CDN for fonts or scripts — a third-party origin
  is a second DNS lookup, a second TLS handshake, a privacy leak and a supply
  chain risk. Subset the fonts to the glyphs actually used; `woff2` only.
- **No framework on the critical path.** React/Next for a static portfolio is
  120 KB spent on nothing. Plain HTML + CSS, with small islands of JS only
  where interaction genuinely requires it. If a generator helps, use one that
  ships zero JS by default (Astro, Eleventy).
- **Images**: AVIF with WebP fallback, explicit `width`/`height` on every one
  (this is where CLS comes from), `loading="lazy"` below the fold. Never a GIF
  — the reference site's single 949 KB GIF is four times our entire budget.

---

## 5. The 3D — additive, never load-bearing

### Technology

**three.js with a real modelled asset.** Not hand-rolled WebGL signed distance
fields. This is settled: a previous attempt at a hand-rolled SDF raymarcher for
the carabiner site failed over six rounds — the geometry never resolved, and
three genuine bugs (a non-uniformly scaled distance field, a material id
destroyed by `smin`, a camera closer than the object's own radius) still left it
looking wrong. three.js with a proper GLTF and HDRI lighting is the well-trodden
route that reliably produces the intended look.

### The rule that keeps it honest

> The 3D is loaded **after** the page is complete and usable, and never at all
> when the visitor's connection or device says no.

Skip the 3D entirely when any of these hold:

- `navigator.connection.saveData` is true
- `prefers-reduced-motion: reduce`
- `navigator.hardwareConcurrency <= 4`
- viewport width below the tablet breakpoint (phones get the static poster)
- WebGL context creation fails

In every skip case the visitor sees a **static poster image** — an AVIF render
of the same scene, under 40 KB. It should look deliberate, not degraded. Most
visitors on phones will only ever see this, and it must be good.

### Scene concept

Tie it to the work, not to fashion. Candidates, in order of preference:

1. **A query plan as a physical structure** — nodes and edges in space, the
   camera moving along the plan as the page scrolls, a Seq Scan visibly heavier
   than an Index Scan. It is Ritish's actual expertise made visible.
2. **A ratchet mechanism** — asymmetric teeth and a pawl, turning one way only.
   Carries carabiner's central idea and is mechanically satisfying.
3. **An instrument being calibrated** — a dial that settles to a reading.

Whichever is chosen: one scene, done extremely well, reused across the page —
not a different toy per section.

### Budget for the 3D layer

- Model: **≤ 300 KB** as compressed `.glb` (Draco or meshopt), loaded lazily
- three.js: import only the modules used; tree-shaken build, target ≤ 120 KB gz
- Cap the renderer at `devicePixelRatio ≤ 1.5`; a retina buffer triples the
  fill cost for a difference nobody sees on soft materials
- **Stop rendering** when the canvas leaves the viewport or the tab is hidden —
  but always paint the first frame, or a page opened in a background tab shows
  an empty canvas when it is finally focused
- Target 60fps on a mid-range phone, measured, not assumed

---

## 6. Security

A static portfolio is low-risk, which is exactly why doing it properly is cheap
and worth it. This site belongs to someone who publishes a security scanner —
it will be looked at.

### Headers, and the hosting decision this forces

GitHub Pages **cannot set HTTP response headers.** That rules out a real
`Content-Security-Policy`, `Strict-Transport-Security`,
`X-Content-Type-Options` and `frame-ancestors`. A `<meta http-equiv>` CSP works
only partially and cannot express `frame-ancestors` at all.

**Therefore: host on Cloudflare Pages or Netlify**, both of which serve a
`_headers` file, both free, both with a global CDN. Keep the repo on GitHub.

Ship these:

```
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self';
  img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none';
  form-action 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), interest-cohort=()
```

`default-src 'none'` with everything self-hosted is achievable precisely because
of the no-CDN decision in §4. The performance choice and the security choice are
the same choice.

### Everything else

- **No third-party JS. None.** No analytics that phone home, no chat widget, no
  font CDN. If analytics are wanted, use a privacy-respecting self-hosted
  counter or server-side logs, and say so on the page.
- **Contact**: a `mailto:` link, or a form posting to a service. If a form
  service is used it becomes a third party in the CSP and in the privacy story —
  prefer `mailto:` and keep `form-action 'none'`.
- **No secrets in the repo.** Nothing needs one. If a deploy token appears, it
  lives in the host's secret store, never in the repo, never in `argv`.
- **Dependencies**: as few as possible, pinned with hashes, Dependabot on.
  Every dependency is a package a visiting security engineer implicitly judges.
- **CI**: Actions pinned to commit SHAs, a read-only top-level `permissions:`
  block, write scope only on the job that deploys.
- **Dogfood**: run **carabiner** on this repo in CI, and say so on the site.
  A portfolio whose CI is gated by the scanner its author wrote is a better
  argument for the scanner than any description of it.
- **`SECURITY.md`** with a real contact, from the first commit.

---

## 7. Phases

Each phase ends with a deployed, working site. The 3D is never a prerequisite
for anything.

### Phase 0 — the whole site, no JavaScript *(first)*
Static HTML and CSS. Every section, all real copy, all project cards, responsive
from 320px up, keyboard navigable, semantic landmarks. Deployed with headers.
**Exit:** complete and good with JS disabled. Lighthouse ≥ 98. Under 150 KB.

### Phase 1 — motion and polish
Scroll-reveals, hover states, the type animation, view transitions. All CSS or
tiny JS islands. Reduced-motion honoured completely.
**Exit:** budgets in §4 still met. CLS still 0.

### Phase 2 — the 3D
three.js, the chosen scene, the static poster fallback, every skip condition
from §5 implemented.
**Exit:** 60fps mid-range phone; identical Lighthouse score to Phase 1 because
none of it is on the critical path.

### Phase 3 — proof
A visible, honest performance section on the site itself: the budgets, the real
measured numbers, and the reference comparison. Turn the constraint into the
argument — this is the part that separates it from every other portfolio.

### Phase 4 — the details
Custom domain, OG images, `sitemap.xml`, RSS if writing happens, a 404 with
personality.

---

## 8. Explicitly not doing this

- No preloader, no "enter site" gate, no fake progress bar
- No hijacked scrolling, no smooth-scroll library that fights the OS
- No auto-playing sound, no cursor that replaces the real one on touch devices
- No React/Next for what is a static document
- No CDN for fonts, scripts or styles
- No GIFs
- No analytics that follow people
- No "certified in…" badge wall, no skill percentage bars — nobody is 87% at Python

---

## 9. How this gets judged

The portfolio succeeds if a senior engineer opening it on a phone, on a train,
on one bar of signal:

1. reads Ritish's name and what he does **within a second**,
2. understands within ten seconds that he builds things that measure themselves,
3. clicks through to something live and working,
4. and only *then* notices the site is also beautiful.

In that order. A site that reverses steps 1 and 4 is the site those comments
were written about.
