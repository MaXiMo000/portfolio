/** Pointer in normalised -1..1 screen space, read inside useFrame.
 *  Not React state: this must not re-render anything. */
export const P = { x: 0, y: 0 }

export function initPointer() {
  // a coarse pointer has no hover position to track
  if (matchMedia('(pointer: coarse)').matches) return () => {}
  const on = (e: PointerEvent) => {
    P.x = (e.clientX / window.innerWidth) * 2 - 1
    P.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', on, { passive: true })
  return () => window.removeEventListener('pointermove', on)
}

/** Entrance progress, 0 → 1. Drives exposure and the opening dolly, so the
 *  instrument resolves out of black instead of simply being there. */
export const I = { v: 0 }
