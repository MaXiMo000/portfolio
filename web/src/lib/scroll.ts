import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initPointer, I } from './pointer'
import { STILL } from './mode'

gsap.registerPlugin(ScrollTrigger)

/**
 * One mutable scroll record, read inside useFrame. Deliberately not React
 * state: scroll must not re-render the tree, only move the camera.
 *  i = active section index, t = 0..1 progress *through* that section.
 */
export const S = { i: 0, t: 0, p: 0 }
export const VIEW = { mobile: false }

// dev only: lets the scene be driven without scrolling, so a transition can be
// parked at any point and inspected
if (import.meta.env.DEV) (globalThis as Record<string, unknown>).__S = S

export const SECTIONS = [
  'hero',
  'carabiner',
  'recur',
  'labledger',
  'quiznest',
  'recipe',
  'experience',
  'skills',
  'contact',
] as const

const clamp = (n: number, a = 0, b = 1) => (n < a ? a : n > b ? b : n)

export function initScroll() {
  // Smooth scrolling is itself motion. Under reduce, hand scrolling back to
  // the OS entirelyrather than damping it.
  const lenis = STILL ? null : new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  const els = SECTIONS.map((n) => document.querySelector<HTMLElement>(`[data-sec="${n}"]`))
  const rail = [...document.querySelectorAll<HTMLAnchorElement>('.rail a')]

  /**
   * The rail is a readout, not a menu — so it has to say which one you are in.
   *
   * Written straight to the DOM rather than lifted into React state, for the
   * same reason `S` is: this runs on every scroll event, and re-rendering the
   * tree to move one hairline would put the whole page on the scroll path.
   * Guarded on the index actually changing, so it touches nothing for the
   * hundreds of events that land inside a section it has already marked.
   *
   * `aria-current` is the half that is not decoration. Seven links reading
   * "01 carabiner … 06 Contact" are, to a screen reader, seven identical
   * destinations with nothing saying which one you are standing in.
   */
  let marked = -1
  const mark = (i: number) => {
    if (i === marked) return
    marked = i
    rail.forEach((a, j) => {
      a.classList.toggle('on', j === i)
      if (j === i) a.setAttribute('aria-current', 'true')
      else a.removeAttribute('aria-current')
    })
  }

  /**
   * Whichever section owns the middle of the viewport is the active one.
   * The previous version used a per-section ScrollTrigger band, and adjacent
   * bands overlapped — so the copy could say "the rotor" while the ratchet was
   * still on screen, and S.t jumped instead of sweeping.
   */
  const update = () => {
    VIEW.mobile = window.innerWidth <= 820
    const mid = window.scrollY + window.innerHeight / 2
    let best = 0
    let bestDist = Infinity
    els.forEach((el, i) => {
      if (!el) return
      const d = Math.abs(el.offsetTop + el.offsetHeight / 2 - mid)
      if (d < bestDist) { bestDist = d; best = i }
    })
    const el = els[best]
    if (!el) return
    S.i = best
    S.t = clamp((mid - el.offsetTop) / el.offsetHeight)
    const max = document.body.scrollHeight - window.innerHeight
    S.p = max > 0 ? window.scrollY / max : 0
    mark(best)
  }

  if (lenis) lenis.on('scroll', update)
  else window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()

  /**
   * Navigating with the rail has to travel, not teleport.
   *
   * "The object never cuts between sections; it transforms" is the whole
   * premise, and the rail was the one control that broke it: a bare `#s4`
   * is a native hash jump, so clicking 04 from the hero skipped every
   * handover between them and left the instrument damping out of whatever
   * it happened to be mid-frame. The scroll position is the only input the
   * scene has, so moving it in one step *is* a cut.
   *
   * Only wired when Lenis exists — under `still` there is no smooth scroll to
   * route through, and a reduced-motion visitor should get the instant jump
   * the browser gives them. That is the correct behaviour there, not a
   * fallback.
   */
  const onNavClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]')
    if (!(link instanceof HTMLAnchorElement)) return
    const el = document.querySelector<HTMLElement>(link.getAttribute('href') || '')
    if (!el) return

    e.preventDefault()
    // Distance matters, but not linearly: one section should feel immediate
    // and five should still be over inside a couple of seconds. Continuity is
    // the point, not holding somebody hostage to their own navigation.
    const steps = Math.abs(el.offsetTop - window.scrollY) / window.innerHeight
    lenis!.scrollTo(el, {
      duration: Math.min(1.6, 0.5 + steps * 0.16),
      easing: (t: number) => 1 - Math.pow(1 - t, 3),   // power3.out, as everywhere else
    })

    // The hash still has to change — the rail is navigation, and a URL that
    // does not move cannot be shared or gone back from.
    history.pushState(null, '', link.getAttribute('href'))

    // And focus has to follow, which is the part that preventDefault would
    // otherwise take away. A skip link that scrolls the page but leaves focus
    // on itself has not skipped anything: the next Tab goes back to the rail.
    el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
  if (lenis) document.addEventListener('click', onNavClick)

  const stopPointer = STILL ? () => {} : initPointer()
  if (STILL) I.v = 1  // no entrance ramp; the image is simply there

  // The entrance. No preloader — the content already painted; this is the
  // instrument resolving out of black while the lines stagger up over it.
  if (!STILL) {
    gsap.from('[data-sec="hero"] > *', {
      y: 34, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.11, delay: 0.12,
    })
    gsap.to(I, { v: 1, duration: 1.7, ease: 'power2.inOut', delay: 0.1 })
  }

  // the copy rises as its section takes the viewport
  const reveals = STILL ? [] : gsap.utils.toArray<HTMLElement>('.col, .hero > *')
  reveals.forEach((el) => {
    // Never hide anything that is already on screen. If a trigger ever failed
    // to fire, the worst case has to be "no animation", never "no content".
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return
    gsap.fromTo(
      el,
      { y: 26, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )
  })

  return () => {
    lenis?.destroy()
    window.removeEventListener('scroll', update)
    document.removeEventListener('click', onNavClick)
    stopPointer()
    window.removeEventListener('resize', update)
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }
}

export const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * dt))
