# Art direction & scroll narrative

The single design contract for this site. Read it before writing any component.

---

## 1. The thesis, and why the ratchet was wrong

The ratchet was carabiner's idea, not Ritish's. Correct call to kill it as the
whole concept. But there *is* a single idea underneath every project he has
built:

| Project | Messy input | Trustworthy output |
|---|---|---|
| carabiner | a repository | a baseline that cannot loosen |
| recur | a bank CSV | which charges actually recur |
| LabLedger | a lab PDF | LOINC codes, converted units, real intervals |
| QuizNest | raw material | assessed knowledge |
| AI-Recipe-Maker | what's in the fridge | a plan with nutrition |

> **He builds instruments that resolve noise into signal.**

That is the concept. Not a gear. **Instruments of resolution.**

## 2. The object: one instrument, six mechanisms

The single most common failure of "3D portfolios" is a different toy per
section and no world. We do the inverse — **continuity of world, variety of
event.**

There is **one** machined instrument on this page. Same alloy, same lighting
rig, same lens, from the first frame to the last. It never disappears between
sections; it **reconfigures**. Each project is a different mechanism the same
instrument can become.

This is what buys both things at once: the coherence award juries reward, and
the per-project variety Ritish asked for.

## 3. Scroll narrative

Each section owns ~150vh of scroll. Cramped scroll distance is the single
biggest amateur tell — the pacing *is* the design.

### 00 · Hero — closed
The instrument sealed. A machined housing, visible seams, tight crop, shallow
depth of field. Nothing moves but a slow drift and one specular sweep across
the chamfer.
**Scroll → camera dollies back; the housing rotates to present its face.**

### 01 · carabiner — the ratchet
The housing opens; a ratchet wheel and pawl extend.
**Scroll → rotation, quantized.** Each scroll segment advances exactly one
tooth: ease-out snap, then a small recoil as the pawl catches. Cyan flash on
the contact face at each click.
**Scroll back and the wheel does not reverse.** The camera returns; the
mechanism holds. This is the one deliberate violation of scroll reversibility
on the entire site, and it is the whole argument of the project.

### 02 · recur — the sorting rotor
The ratchet retracts. ~180 small chips appear as a chaotic cloud — transactions.
**Scroll → the rotor spins up and separates them.** Recurring charges lock into
three clean concentric rings; the noise drifts outward and dims. The HUD counts
up as each one locks. Signal literally separating from noise.

### 03 · LabLedger — the spectrometer
The rotor collapses into a rail. A white beam enters, strikes a prism, splits.
**Scroll → the beam sweeps; each band snaps to a labelled LOINC row.**
One band refuses to snap and holds amber: *anything uncertain goes to a human.*
That is the only amber in the entire scene, and it is the most honest thing on
the site.

### 04 · QuizNest — the tumbler
Five concentric rings, each with a notch, each scrambled.
**Scroll → the rings rotate into alignment, one after another.** When every
notch lines up, a beam passes straight through the stack. Knowledge either
aligns or it does not; a score out of ten does not tell you which ring is off.

### 05 · AI-Recipe-Maker — the dosing manifold
Five pistons over a collector.
**Scroll → each piston fires in sequence, dosing a measured amount.** The
doses fall, slide along the collector and converge into one output. Five
measured inputs, one plan.

*(Cut: the plate carousel and the gauge. HouseofBooks is out for now, and the
performance section went with it — the perf argument stopped being the story
once the experience became the priority, so a whole section defending it was
dead weight.)*

### 06 · Contact — closes
The housing seals. Ends exactly where it started.

## 4. Material world

- **One alloy.** Cool nickel steel, roughness ~0.25, anisotropy on turned faces.
  The metal is read almost entirely from the environment, not from lights.
- **One HDRI.** A machine-shop / studio environment. This is the single largest
  asset on the site and it is the correct place to spend the budget: on metal,
  the environment *is* the material.
- **Post:** contact shadows, restrained bloom, depth of field, chromatic
  aberration on extreme edges only, film grain.
- **No emissive** anywhere except the measurement light.

## 5. Palette

| Token | Value | Rule |
|---|---|---|
| `--void` | `#08090C` | ground |
| `--chalk` | `#EDECE8` | primary type |
| `--alloy` | `#9AA6B4` | secondary type; the instrument's own value |
| `--beam` | `#86E9DE` | the measurement light. **Emitted light and live values only** — never a border, never a button fill. |
| `--escalate` | `#E8873B` | *a human decides.* Appears exactly twice on the whole site. |
| `--hair` | `rgba(255,255,255,.07)` | every rule and panel edge. Never brighter. |

The discipline is what keeps this off the acid-accent-on-black pile: the signal
colour is **light inside the scene**, not decoration on the UI.

## 6. Type

- **Archivo Variable** — display and UI. The width axis (62–125) is the
  identity: statements set wide, labels set condensed. Width contrast within
  one family, not a font pairing.
- **Instrument Serif Italic** — one gesture, used *only* for human-judgment
  moments and section numerals. Never for a heading that a grotesque could do.
- **Commit Mono** — every number, unit and identifier. Tabular figures always.

## 7. Pacing — where "premium" actually comes from

1. **No preloader.** Content HTML paints immediately. Then a ~900 ms
   orchestrated entrance: three staggered line masks, then the instrument
   resolving out of black on the specular sweep.
2. **Camera never moves linearly.** Eased curves only. Lenis damping ~0.09.
3. **Transitions are continuous.** The object transforms between sections; it
   never cuts, never fades out and back in.
4. **~60% of every frame stays empty.** Negative space is the luxury signal.
   Everything above fails if the frame is crowded.

## 8. Accessibility floor — non-negotiable

- `prefers-reduced-motion`: a complete, composed **static** composition per
  section with real content. Not the same page with motion switched off.
- Content prerendered in HTML and readable with the canvas dead.
- Skip link; every section keyboard reachable; visible focus.
- **No autoplay audio.** The reference sites do it; we are not going to.

## 9. Stack and budget

React · React Three Fiber · drei · Three.js · GSAP ScrollTrigger · Lenis ·
`@react-three/postprocessing`, built with Vite.

The budget is **split, and only one half is capped.**

- **The document** — prerendered, readable and navigable with the canvas dead,
  no preloader, zero layout shift. This is a floor, not a target.
- **The experience layer** — deliberately uncapped. ~283 KB gzipped and that is
  fine. It loads after idle and never blocks first paint.

An earlier revision capped total JS at 40 KB. This stack is ~400 KB gzipped
before a line of our own code, so that number is void. The floor is what
survived, and the floor is the part that actually mattered.

## 10. Hosting and headers

**Netlify, not GitHub Pages.** Pages cannot set HTTP response headers, which
rules out a real CSP, HSTS and `frame-ancestors`. That single limitation
decides the host. Config lives in `netlify.toml`; headers in
`web/public/_headers`:

```
Content-Security-Policy: default-src 'none'; script-src 'self'; ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()
```

`default-src 'none'` is reachable precisely *because* nothing is loaded from a
third party. The performance choice and the security choice are the same
choice. The one outstanding exception is the fonts — still on Google's CDN, and
named explicitly in `style-src`/`font-src` until they are self-hosted as subset
`woff2`, at which point the whole policy collapses to `'self'`.

No third-party JS. No analytics that phone home. Contact is a `mailto:`, so
`form-action` stays `'none'`.
