# portfolio

An interactive WebGL portfolio for **Ritish Saini** — backend engineer,
Postgres, security. Live at **[ritishsaini.netlify.app](https://ritishsaini.netlify.app)**.

> **Instruments of resolution.** Every project here takes something messy and
> untrusted and returns something you can rely on. So the site is *one* machined
> instrument, under one lighting rig, that reconfigures itself per project.

The usual failure of a 3D portfolio is a different toy per section and no world.
This does the inverse — continuity of world, variety of event. The object never
cuts between sections; it transforms.

| § | Project | Mechanism, and what scroll drives |
|---|---|---|
| 00 | — | sealed housing; eight wedges hinge open as 01 arrives inside them |
| 01 | [carabiner](https://github.com/MaXiMo000/carabiner) | ratchet — one tooth per step, hot sparks. Scroll back and the pawl *lifts*: a ratchet is released, never reversed |
| 02 | recur | sorting rotor — recurring charges lock into rings, noise is flung outward |
| 03 | [LabLedger](https://labledger-web.onrender.com/) | spectrometer — bands snap to LOINC rows; one holds amber and escalates |
| 04 | [QuizNest](https://quiz-app-cp2h.onrender.com/) | tumbler — five notched rings; the beam passes only when all align |
| 05 | AI-Recipe-Maker | dosing manifold — five pistons fire in sequence into one output |
| 06 | — | the housing seals; ends where it started |

## Running it

```bash
npm install --prefix web
npm run dev --prefix web
```

| Script | Does |
|---|---|
| `npm run build` | typecheck, bundle, SSR-prerender the markup into `index.html` |
| `npm run shots` | screenshot every section headlessly, report clipped text |
| `npm run fonts` | re-download the self-hosted woff2, regenerate `src/fonts.css` |
| `npm run og` | re-render `og.html` → `public/og.png` |

`shots` exists because dev preview surfaces blank out on scroll, and headless
Chrome without a GL backend silently falls back to the no-WebGL path — so you
end up auditing the wrong page. Pass a viewport: `npm run shots -- 1440 900`.

## Design

**Palette.** Six tokens. The signal colour is *light inside the scene*, not
decoration on the UI — which is what keeps this off the acid-accent-on-black pile.

| Token | | Rule |
|---|---|---|
| `--void` | `#08090C` | ground |
| `--chalk` | `#EDECE8` | primary type |
| `--alloy` | `#98A3B1` | secondary type; the instrument's own value |
| `--beam` | `#86E9DE` | measurement light and live values only — never a border or a fill |
| `--escalate` | `#E8873B` | *a human decides.* Appears twice on the whole site |
| `--hair` | `rgba(255,255,255,.07)` | every rule and panel edge. Never brighter |

**Type.** Archivo variable carries the identity through its **width axis**
(62–125) — statements set wide, labels condensed. That is a typographic idea,
not a font pairing. Instrument Serif italic is one gesture, reserved for
human-judgment moments. JetBrains Mono for every number and identifier.

**Contrast is bought with separation, not colour.** White type is only 2.39:1
over bright metal, so no palette fixes copy sitting on the instrument. Desktop
crops the object to one side; narrow screens lift it into the top quarter and
put a ground scrim under the text. Every token clears WCAG AA against the ground
on its own — nothing under 4.5:1 ships, however good it looks.

**Materials.** One alloy; a procedural studio of lightformers rather than an
HDRI. On machined metal the environment *is* the material, and shaped softboxes
give sharper, art-directable specular than a photographic probe, at zero bytes
and with no third-party origin. All geometry is generated in code — no `.glb`.

**Pacing.** Each section owns ~150vh; cramped scroll is the biggest amateur
tell. Camera moves on eased curves only, and roughly 60% of every frame stays
empty.

## Rules the build keeps

- **Content is readable with the canvas dead.** `prerender.js` bakes the markup
  into `index.html` and the client hydrates it. The experience layer loads after
  idle and is skipped on `save-data`, `prefers-reduced-motion`, or no WebGL.
- **A lost WebGL context can never take the page down** — `lib/ExperienceBoundary.tsx`.
- **The render loop stops when the tab is hidden** — measured at 414 draw calls
  per 1.5s visible, 0 hidden. It never pauses before the first frame, or a page
  opened in a background tab would show an empty canvas when focused.
- **No preloader, no autoplay audio, no third-party requests.** The loading
  state is a technical drawing of the instrument, in the space it will occupy;
  it gates nothing and reports no fake progress.
- **Everything is same-origin**, so the CSP is `default-src 'none'` with the rest
  `'self'`. Fonts are self-hosted, unmodified and deliberately un-subsetted — a
  dropped glyph is a worse failure than a few kB.

## Stack and deploying

React · React Three Fiber · drei · three.js · GSAP ScrollTrigger · Lenis ·
`@react-three/postprocessing`, built with Vite.

Netlify, not GitHub Pages: Pages cannot set response headers, which rules out a
real CSP, HSTS and `frame-ancestors`. `netlify.toml` sets base `web/`;
`public/_headers` carries the policy. **Base directory must be `web`.**

Measured on the live site — desktop **94 / 94 / 100 / 100**, mobile
**97 / 100 / 100 / 100**, CLS 0, TBT 0 ms.

## Not done yet

- `prefers-reduced-motion` gets a plain page, not the composed static
  composition per section that it should
- four of the five handovers still just scale and recede; only housing→ratchet
  is a real morph
- no CI and no `SECURITY.md`; carabiner should gate this repo and say so on the site
- no custom domain, no CV link, no `404.html` / `robots.txt` / `sitemap.xml`
