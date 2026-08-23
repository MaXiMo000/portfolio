/**
 * Three modes, not two.
 *
 *   live  — the full experience
 *   still — a composed, frozen frame per section. Reduced motion should not
 *           mean a stripped page: same instrument, same lighting, same
 *           composition, simply not moving. One render per section change.
 *   off   — no canvas at all (save-data, or no WebGL)
 */
export type Mode = 'live' | 'still' | 'off'

export function detectMode(): Mode {
  if (typeof window === 'undefined') return 'off'
  const saveData = (navigator as unknown as { connection?: { saveData?: boolean } })
    .connection?.saveData === true
  let webgl = false
  try {
    webgl = !!document.createElement('canvas').getContext('webgl2')
  } catch { /* no webgl */ }
  if (!webgl || saveData) return 'off'
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'still' : 'live'
}

/** Read once at module load so the scene and the scroll layer agree. */
export const MODE: Mode = detectMode()
export const STILL = MODE === 'still'
