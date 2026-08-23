/**
 * Lets the DOM reach into the canvas. Hovering a project's link advances that
 * project's mechanism by one step — the two layers behave like one machine
 * rather than text sitting on top of a video.
 */
export const NUDGE = { section: -1, count: 0 }

export const nudge = (section: number) => {
  NUDGE.section = section
  NUDGE.count++
}
