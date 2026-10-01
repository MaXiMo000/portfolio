/** Pointer in normalised -1..1 screen space, read inside useFrame.
 *  Not React state: this must not re-render anything. */
export const P = { x: 0, y: 0 }

/** A knock to the gyroscope, decayed by it each frame. Fed by a fast flick
 *  across its half of the screen, or a tap on the contact section. */
export const KICK = { v: 0 }
export const knock = (n: number) => { KICK.v = Math.min(1.6, KICK.v + n) }

export function initPointer() {
  // a coarse pointer has no hover position to track
  if (matchMedia('(pointer: coarse)').matches) return () => {}
  const on = (e: PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    // only a genuine flick over the instrument's side counts, not drift
    const d = Math.hypot(x - P.x, y - P.y)
    if (x > 0 && d > 0.05) knock((d - 0.05) * 3)
    P.x = x
    P.y = y
  }
  window.addEventListener('pointermove', on, { passive: true })
  return () => window.removeEventListener('pointermove', on)
}

/** Entrance progress, 0 → 1. Drives exposure and the opening dolly, so the
 *  instrument resolves out of black instead of simply being there. */
export const I = { v: 0 }
