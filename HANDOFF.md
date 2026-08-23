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

He also wants a site that makes people's eyes go wide, with real 3D.

**Those are not in conflict, and the tension is the whole design brief:**

> An awwwards-grade portfolio that loads like a text file.

This is measurable, defensible, and rarer than either half on its own. A "wow"
site that also scores 98 on mobile is the thing that impresses engineers, not
just designers.

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

## Status

Nothing built yet. This folder contains the plan only.

## First move in the new chat

Do not open with the 3D. Build §7 Phase 0 — the complete, fast, working site
with no JavaScript required. Then layer everything else on top of something
that already works.
