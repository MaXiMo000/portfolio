# Art direction & scroll narrative

Supersedes `PLAN.md` §3 and §5. Read this before writing any component.

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
| HouseofBooks | a catalogue | a fulfilled order |

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

### 04 · The rest — the plate carousel
The instrument idles, reflective. QuizNest, AI-Recipe-Maker, HouseofBooks
arrive on machined plates swinging in on a spindle. Faster, lighter — a
deliberate release of pressure after three heavy sections. Pacing needs a
downbeat or the whole thing reads as one long shout.

### 05 · Measurements — the gauge
The instrument becomes a dial. The needle sweeps and settles on the **real**
measured Lighthouse number, read live. The performance argument lives here.

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

## 9. Stack

React · React Three Fiber · drei · Three.js · GSAP ScrollTrigger · Lenis ·
`@react-three/postprocessing`. HDRI lighting, self-hosted at ship time.

**Budget consequence, stated plainly:** this stack is ~400 KB gzipped before our
own code. `PLAN.md` §4 Tier 1's "≤40 KB JS" cannot survive it and is void. What
survives is the *floor*: content prerendered, readable and navigable without
JS, no preloader, no layout shift. The experience layer is uncapped.
