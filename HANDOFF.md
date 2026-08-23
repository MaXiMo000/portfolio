# Portfolio — start here

This is a cold-start handoff. Read this file, then `PLAN.md`. Everything needed
to begin is in the two of them; nothing depends on remembering an earlier chat.

## Who this is for

**Ritish Saini** — backend engineer at WizCommerce. Postgres-heavy: server-side
row model tuning, generic-plan vs partial-index traps, statement timeouts,
row-level security. Writes Python and JavaScript. GitHub `MaXiMo000`, LinkedIn
`ritish-saini-2540a5253`.

## The one thing that decides every other decision

Ritish shared this view and agrees with it:

> "Everybody wants all these unnecessary bells and whistles, but what happens
> when the user is on mobile with a single bar signal? What about the user who
> can't afford high-speed internet? What about the guy who has a million tabs
> open already?"

He also wants a site that makes people's eyes go wide, with real 3D — and he
has since said the 3D and the scroll work are the priority, and that **the 3D
is allowed to be slow and heavy.**

**Those are not in conflict, and the tension is the whole design brief:**

> An awwwards-grade portfolio that loads like a text file.

### How the two are actually reconciled — read this before changing anything

The budget is **split in two**, and only one half is capped (`PLAN.md` §4):

- **Tier 1, the document** — capped hard, ≤ 200 KB, LCP ≤ 1.5s, CLS 0, checked
  in CI. Costs nothing to keep, so it is kept.
- **Tier 2, the 3D** — **deliberately uncapped, ~2–3 MB is fine.** Loaded after
  the document is complete and interactive.

Nothing is traded, because Lighthouse and LCP are measured on the critical path
and the 3D is not on it. The site scores 98 on mobile *and* has the heavy,
beautiful 3D. If the 3D can move the Tier 1 number, the **load order** is
wrong — not the budget.

A "wow" site that also scores 98 on mobile is the thing that impresses
engineers, not just designers.

## Evidence, measured — not asserted

`meermohsin.me`, one of Ritish's own reference sites, on a fast connection:

| | |
|---|---|
| Total transfer | **2,441 KB** |
| Largest asset | a **949 KB GIF** |
| 3D model | 845 KB `.glb` |
| JS bundle | 231 KB |
| Preloader | still spinning after 3+ seconds |

At ~50 KB/s (one bar), that is roughly **48 seconds** before the site is usable.
It is beautiful, and it is exactly the site those comments are about.

Our budget is **ten times smaller**. See `PLAN.md` §4.

## The design direction, in one paragraph

**A machine room, shot like a film.** The 3D hero is a machined ratchet —
asymmetric teeth, one direction only, which is carabiner's central idea made
physical — cropped hard off the right edge of a dark, lit stage. **Steel wheel,
brass pawl**, and that material pair *is* the colour system: brass (`#C9A45E`)
appears only where something is being held, which means live values and active
state. Ground is `#06070A` with a real off-canvas key light, vignette and film
grain. The drafting rigor from the earlier revision survives as the **HUD** —
section rail, callouts, telemetry — not as the page ground.

An earlier revision proposed a pale drafting sheet. Ritish rejected it against
reference renders. Do not reopen that; the reversal is recorded in `PLAN.md` §3.

**Signature element: a fixed title block, bottom-left, showing the page's own
live telemetry** — bytes actually transferred, LCP once it fires, whether the
3D layer is still idle. Real `PerformanceObserver` numbers. The site measures
itself in public while you read it.

**Reference mockup: `mockups/hero.html`.** Open it. It is the agreed
composition, built in plain HTML/CSS/SVG. The gear in it is a hand-shaded SVG
stand-in — Phase 1 replaces it with three.js.

## Status

Nothing built yet. This folder contains the plan only.

## First move in the new chat

Do not open with the 3D. Build §7 Phase 0 — the complete, fast, working site
with no JavaScript required, in the §3 palette and type. Then Phase 1 is the
3D, then Phase 2 choreographs the page's motion to it.

Phase order changed on purpose: the 3D moved **ahead of** the motion work,
because the scroll choreography is driven by the mechanism. Building all the
reveals first means rebuilding them around the canvas.
