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

**The machine room.** Ritish's work is measurement: query plans, LOINC codes,
tenant isolation proofs, 60-repo corpora, entropy thresholds. And the 3D hero
(§5) is a *machined part*. A machined part ships with a document — dimensioned
views, a title block, tolerance callouts, a material spec, a revision row.

So the site is not a dark tech portfolio with a 3D object dropped in it. The
site **is the drawing**, and the ratchet is the part it documents.

**Reversed on 2026-08-23.** An earlier revision of this plan argued for a pale
drafting sheet. Ritish rejected it against reference renders and he was right:
the machine wants a machine room. **Dark, cinematic, lit** — the difference from
the generic dark portfolio is not the hue, it is *depth and light*. Generic dark
is a flat near-black with a neon accent. This is layered darkness with a real
key light, warm champagne specular against cool steel shadow, film grain, and a
vignette. The drafting rigor survives as the **HUD layer** — the callouts,
telemetry and section rail — not as the ground.

**Palette** — six tokens, all named. No neon, no glassmorphic cards.

| Token | Value | Used for |
|---|---|---|
| `--void` | `#06070A` | page ground |
| `--chalk` | `#E9E7E2` | primary type |
| `--steel` | `#8B95A2` | secondary type, the wheel's cool body |
| `--brass` | `#C9A45E` | **signal.** The pawl is brass; so is every live value and active state. |
| `--witness` | `#C8340C` | warning. Three uses on the whole site. |
| `--hair` | `rgba(255,255,255,.07)` | every rule and panel border. Never brighter. |

The material story carries the colour story: **steel wheel, brass pawl.** Gold
is not a "premium accent" borrowed from a template — it is the pawl, the part
that does the locking. Anywhere brass appears, something is being held.

Atmosphere is not optional and is where cheap dark UIs fail: a radial key light
off-canvas top-right, a warm secondary, a vignette, and a real film grain
(`feTurbulence`, ~25% over `overlay`). Grain also kills gradient banding, which
is the single most common tell of an amateur dark page.

**Type** — two variable faces, two `woff2` files, both self-hosted and subset.

- **Archivo Variable** — display and body. It carries a real width axis
  (62–125), so the identity comes from *width contrast within one family*:
  the name set extremely expanded, section labels set condensed and small.
  That is a typographic idea, not a font pairing.
- **Commit Mono** — every number, every identifier, every unit. Tabular
  figures on, always. Numbers are the content here.

**Structure** — the drafting vernacular, used only where it states something
true:

- **Dimension lines** with real arrowheads that measure the actual layout, and
  annotate the real value: `↕ 640`, `⟷ 72ch`. Pure CSS. Never a fake number.
- **Title block** — see Signature.
- **Part numbering on projects only**, because the projects genuinely are a
  parts list. No `01 / 02 / 03` on anything that is not a sequence.

**Signature — the live title block.** Bottom-left of the viewport, fixed, the
way a title block sits on a real drawing sheet. It holds sheet name, revision,
and a **live readout of the page's own telemetry**: bytes actually transferred
so far, LCP once it fires, current scroll depth as a dimension. Real
`PerformanceObserver` numbers, never hardcoded.

That single element is the whole thesis in one component — the site measures
itself, in public, while you read it. It also means §7 Phase 3 stops being a
section you scroll to and becomes ambient. Everything else on the page stays
quiet so this is the thing that gets remembered.

### Motion

Motion must serve comprehension. A scroll-triggered reveal that shows a plan
changing, or a ratchet that turns one way, teaches something. A parallax card
tilt teaches nothing and costs a repaint.

The scroll choreography is one idea, applied consistently: **scroll is the
ratchet's input shaft.** Scrolling advances the wheel; each section boundary is
one tooth passing the pawl. It cannot run backwards — scroll up and the camera
returns, but the mechanism holds. That is carabiner's central idea (a baseline
that only tightens) made physical, and it gives every section boundary a real
mechanical event instead of a fade-in.

Every animation respects `prefers-reduced-motion: reduce` — completely, not by
shortening durations.

---

## 4. Performance budget — two tiers, and only one of them is capped

The budget is split. **The document is capped hard; the 3D layer is not.** This
is the resolution of the whole brief, and it costs nothing: Lighthouse and LCP
are measured on the critical path, and the 3D is not on the critical path. You
keep the score *and* the spectacle. Nothing is traded.

### Tier 1 — the document. Pass/fail, checked in CI.

| Metric | Budget | Reference site for contrast |
|---|---|---|
| HTML + critical CSS, first paint | **≤ 50 KB** | — |
| Total transfer, first view, no 3D | **≤ 200 KB** | 2,441 KB |
| JavaScript, first view | **≤ 40 KB** | 231 KB |
| Largest Contentful Paint (mobile, throttled) | **≤ 1.5 s** | — |
| Cumulative Layout Shift | **0** | — |
| Lighthouse performance (mobile) | **≥ 95** | — |
| Time to interactive without any JS | **immediate** | never |

### Tier 2 — the 3D layer. Deliberately uncapped.

Loaded after the document is complete, idle, and interactive. **~2–3 MB is
fine.** Spend it on the HDRI and on render quality; that is where the look
lives. The one hard rule is the load *order*, not the size:

- it never blocks first paint, never blocks interaction, never blocks fonts
- it must be cancellable — navigate away mid-download and nothing is stuck
- CI asserts Tier 1 with the 3D layer *excluded from the graph entirely*; if
  the 3D can affect the Tier 1 number, the load order is wrong, not the budget

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

## 5. The 3D — the headline, still not load-bearing

This is where the quality bar is set. It should be genuinely excellent, and it
is allowed to be expensive (§4 Tier 2). What it is *not* allowed to do is hold
up the document.

### Scene — settled: the ratchet

A ratchet wheel and pawl. Asymmetric teeth, machined metal, one direction only.
Chosen over the query-plan structure for three reasons:

1. **Scroll maps to it directly.** Scroll → rotation is a one-to-one physical
   mapping, not an invented one. A camera flying along a node graph is a
   metaphor; a wheel turning under your thumb is the thing itself.
2. **It is the most reliably beautiful thing in three.js.** Machined metal
   under a good HDRI is a solved, gorgeous look. A floating node graph is one
   bad decision away from generic-tech-blob.
3. **It carries carabiner's actual idea** — a baseline that only ratchets
   tighter, never loosens.

One scene, done extremely well, reused down the whole page. Not a toy per
section. The query-plan visualisation survives as a cheap 2D scroll-driven
piece later — it teaches something and costs almost nothing.

### Technology

**three.js — settled.** Not hand-rolled WebGL signed distance fields. A
previous attempt at a hand-rolled SDF raymarcher for the carabiner site failed
over six rounds: the geometry never resolved, and three genuine bugs (a
non-uniformly scaled distance field, a material id destroyed by `smin`, a
camera closer than the object's own radius) still left it looking wrong.

**Generate the geometry in code. Do not ship a `.glb`.** A ratchet is a
parametric part: the teeth are one `Shape` extruded around a circle, the hub is
a lathe, the pawl is a second extrusion. This is not a cost-saving compromise —
it is the *better* result, because procedural teeth are perfect and adjustable
where a modelled mesh is fixed. Three consequences:

- geometry costs **zero bytes** and no Blender round-trip
- no Draco/meshopt decoder, therefore **no `wasm-unsafe-eval` in `script-src`**
  — the §6 CSP stays `default-src 'none'`
- the largest 3D asset becomes the **HDRI environment map**, which is correct,
  because on metal the environment *is* the material. Spend the budget there:
  a real studio HDRI, not a three-light rig.

Mesh detail is not what makes this look expensive. Environment, roughness map,
anisotropy on the machined faces, and a correct tone map are.

### The rule that keeps it honest

> The 3D loads **after** the page is complete and usable. It never blocks, and
> it degrades to something deliberate rather than something missing.

**Phones get the real scene, not a poster.** They are most of the audience;
handing them a JPEG of the good version is the wrong trade now that quality is
the priority. Instead, one scene with two quality profiles:

| | Desktop | Phone / low-power |
|---|---|---|
| `devicePixelRatio` cap | 2.0 | 1.25 |
| Environment | full HDRI | pre-filtered, half resolution |
| Postprocessing | on | off |
| Shadows | contact shadows | baked into the ground texture |

Skip the 3D **entirely** only when the visitor or the hardware says no:

- `navigator.connection.saveData` is true
- `prefers-reduced-motion: reduce`
- WebGL context creation fails
- (`hardwareConcurrency` and viewport width no longer gate it — they select the
  low-power profile instead)

In those three cases the visitor sees a **static poster** — an AVIF render of
the same scene, under 40 KB, composed to look deliberate. It is now a genuine
fallback rather than the default mobile experience.

### Engineering rules for the 3D layer

- three.js tree-shaken; import only the modules used
- **Damp the scroll inside the canvas, never on the page.** Page scroll stays
  native and instant; the camera and wheel lerp toward the scroll value. That
  is where the "butter" actually comes from, and it costs nothing in scroll
  integrity. No smooth-scroll library. (See §8 — this is the one amendment.)
- **Stop rendering** when the canvas leaves the viewport or the tab is hidden —
  but always paint the first frame, or a page opened in a background tab shows
  an empty canvas when it is finally focused
- Render only on scroll change plus a short settle, not a permanent rAF loop.
  A static wheel should cost 0% CPU.
- 60fps on a mid-range phone, measured on a real device, not assumed

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

**The 3D moved earlier.** It used to come after the motion work. That was
wrong: the scroll choreography is *driven by* the mechanism, so building all the
reveals first means rebuilding them around the canvas. The scene now lands
second, and the page's motion is choreographed to it once it exists.

### Phase 0 — the whole site, no JavaScript *(still first, non-negotiable)*
Static HTML and CSS. Every section, all real copy, all project cards, the
type and palette from §3, responsive from 320px up, keyboard
navigable, semantic landmarks. Deployed with headers.
**Exit:** complete and good with JS disabled. Lighthouse ≥ 98. Under 150 KB.

### Phase 1 — the 3D *(moved up)*
three.js, procedural ratchet geometry, the HDRI and material work, both quality
profiles, the poster fallback, every skip condition from §5. Get the object
looking genuinely excellent standing still before anything animates it.
**Exit:** it looks expensive in a screenshot. 60fps on a real mid-range phone.
Tier 1 budgets unchanged, because none of it is on the critical path.

### Phase 2 — scroll choreography
Scroll drives the wheel; section boundaries are teeth. The DOM reveals, hover
states and view transitions are choreographed to the same scroll value, so the
page and the mechanism move as one system. Native CSS scroll-driven animations
where they reach; damping inside the canvas only.
**Exit:** Tier 1 budgets still met. CLS still 0. Reduced-motion path is a
complete, composed static page — not the same page with the motion switched off.

### Phase 3 — proof
The live title block from §3 goes real: actual `PerformanceObserver` numbers,
bytes transferred, LCP. Plus the honest performance section — the budgets, the
measured numbers, the reference comparison. Turn the constraint into the
argument. This is the part no other portfolio has.

### Phase 4 — the details
Custom domain, OG images, `sitemap.xml`, RSS if writing happens, a 404 with
personality.

---

## 8. Explicitly not doing this

- No preloader, no "enter site" gate, no fake progress bar
- No hijacked scrolling, no smooth-scroll library that fights the OS.
  *Amended:* damping is allowed, but only inside the WebGL canvas (§5). The
  page's own scroll stays native, instant and OS-native. Always.
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
