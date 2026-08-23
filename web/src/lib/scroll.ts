import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * One mutable scroll record, read inside useFrame. Deliberately not React
 * state: scroll must not re-render the tree, only move the camera.
 *  i = active section index, t = 0..1 progress *within* that section.
 */
export const S = { i: 0, t: 0, p: 0, vel: 0 }

export const SECTIONS = [
  'hero',
  'carabiner',
  'recur',
  'labledger',
  'range',
  'measurements',
  'contact',
] as const

export function initScroll() {
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  SECTIONS.forEach((name, i) => {
    const el = document.querySelector<HTMLElement>(`[data-sec="${name}"]`)
    if (!el) return
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate(self) {
        // only the section actually filling the viewport drives the scene
        if (self.progress > 0.25 && self.progress < 0.75) {
          S.i = i
          S.t = (self.progress - 0.25) * 2
          S.vel = self.getVelocity()
        }
      },
    })
  })

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => (S.p = self.progress),
  })

  return () => {
    lenis.destroy()
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }
}

export const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * dt))
