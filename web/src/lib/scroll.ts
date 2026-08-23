import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initPointer, I } from './pointer'

gsap.registerPlugin(ScrollTrigger)

/**
 * One mutable scroll record, read inside useFrame. Deliberately not React
 * state: scroll must not re-render the tree, only move the camera.
 *  i = active section index, t = 0..1 progress *through* that section.
 */
export const S = { i: 0, t: 0, p: 0 }

export const SECTIONS = [
  'hero',
  'carabiner',
  'recur',
  'labledger',
  'quiznest',
  'recipe',
  'contact',
] as const

const clamp = (n: number, a = 0, b = 1) => (n < a ? a : n > b ? b : n)

export function initScroll() {
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  const els = SECTIONS.map((n) => document.querySelector<HTMLElement>(`[data-sec="${n}"]`))

  /**
   * Whichever section owns the middle of the viewport is the active one.
   * The previous version used a per-section ScrollTrigger band, and adjacent
   * bands overlapped — so the copy could say "the rotor" while the ratchet was
   * still on screen, and S.t jumped instead of sweeping.
   */
  const update = () => {
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
  }

  lenis.on('scroll', update)
  window.addEventListener('resize', update)
  update()

  const stopPointer = initPointer()

  // The entrance. No preloader — the content already painted; this is the
  // instrument resolving out of black while the lines stagger up over it.
  gsap.from('[data-sec="hero"] > *', {
    y: 34, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.11, delay: 0.12,
  })
  gsap.to(I, { v: 1, duration: 1.7, ease: 'power2.inOut', delay: 0.1 })

  // the copy rises as its section takes the viewport
  const reveals = gsap.utils.toArray<HTMLElement>('.col, .hero > *')
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
    lenis.destroy()
    stopPointer()
    window.removeEventListener('resize', update)
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }
}

export const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * dt))
