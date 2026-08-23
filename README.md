# portfolio

An interactive WebGL portfolio for **Ritish Saini** — backend engineer,
Postgres, security.

> **Instruments of resolution.** Every project here takes something messy and
> untrusted and returns something you can rely on. So the site is one machined
> instrument that reconfigures itself per project, under one lighting rig.

| Section | Project | Mechanism |
|---|---|---|
| 00 | — | the sealed housing |
| 01 | [carabiner](https://github.com/MaXiMo000/carabiner) | the ratchet — advances a tooth per scroll, never reverses |
| 02 | recur | the sorting rotor — recurring charges lock into rings, noise is flung out |
| 03 | [LabLedger](https://labledger-web.onrender.com/) | the spectrometer — one band refuses to resolve and escalates |
| 04 | [QuizNest](https://quiz-app-cp2h.onrender.com/) | the tumbler — five notched rings; the beam passes only when all align |
| 05 | AI-Recipe-Maker | the dosing manifold — five measured inputs, one output |
| 06 | — | the housing seals |

## Running it

```bash
npm install --prefix web
npm run dev --prefix web
```

## Stack

React · React Three Fiber · drei · three.js · GSAP ScrollTrigger · Lenis ·
`@react-three/postprocessing`, built with Vite.

**No HDRI file and no CDN.** The environment is built from lightformers — on
machined metal the environment *is* the material, and shaped softboxes give
sharper, art-directable specular streaks than a photographic probe while
costing zero bytes. All geometry is generated in code; there is no `.glb`.

## Ground rules the build keeps

- Content is readable with the canvas dead — the build prerenders the markup
  into `index.html` (`web/prerender.js`) and the client hydrates it. The
  experience layer loads after idle and is skipped entirely on `save-data`,
  `prefers-reduced-motion`, or when WebGL is unavailable.
- A lost WebGL context can never take the page down — see
  `web/src/lib/ExperienceBoundary.tsx`.
- No preloader, no autoplay audio, no third-party requests.

## Documents

[`ART-DIRECTION.md`](ART-DIRECTION.md) — the concept, palette, type, scroll
narrative and the rules the build keeps. The single design contract; read it
before touching a component.

## Status

Work in progress. Hero, entrance and pointer parallax are done; the
per-section mechanisms are implemented and still being tuned.
