import * as THREE from 'three'

/** Asymmetric ratchet: a long ramp up to each tip, then a radial face back.
 *  Generated, not modelled — the teeth are exact and tunable, and it ships
 *  zero bytes of mesh (see ART-DIRECTION.md §4). */
export function ratchetGeometry(teeth = 24, rTip = 1, rRoot = 0.86) {
  const s = new THREE.Shape()
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2
    const a1 = ((i + 1) / teeth) * Math.PI * 2
    const ar = a0 + (a1 - a0) * 0.14
    const p = (r: number, a: number) =>
      [r * Math.cos(a), r * Math.sin(a)] as [number, number]
    if (i === 0) s.moveTo(...p(rRoot, a0))
    else s.lineTo(...p(rRoot, a0))
    s.lineTo(...p(rRoot, ar))
    s.lineTo(...p(rTip, a1))
  }
  s.closePath()

  const bore = new THREE.Path()
  bore.absarc(0, 0, 0.2, 0, Math.PI * 2, true)
  s.holes.push(bore)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3
    const h = new THREE.Path()
    h.absarc(0.52 * Math.cos(a), 0.52 * Math.sin(a), 0.11, 0, Math.PI * 2, true)
    s.holes.push(h)
  }

  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.17,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 2,
    curveSegments: 24,
  })
  g.center()
  return g
}

/** The closed housing: a lathed cylinder with real chamfers and a seam. */
export function housingGeometry() {
  const pts: THREE.Vector2[] = []
  const v = (x: number, y: number) => pts.push(new THREE.Vector2(x, y))
  v(0, -0.62); v(0.52, -0.62); v(0.6, -0.55)
  v(0.6, -0.34); v(0.63, -0.31); v(0.63, -0.26); v(0.6, -0.23)
  v(0.6, 0.23); v(0.63, 0.26); v(0.63, 0.31); v(0.6, 0.34)
  v(0.6, 0.55); v(0.52, 0.62); v(0, 0.62)
  const g = new THREE.LatheGeometry(pts, 96)
  g.computeVertexNormals()
  return g
}

/** The pawl: a tapered arm that only lets the wheel go one way. */
export function pawlGeometry() {
  // The arm runs along -X, back toward the wheel it holds. It used to run +X,
  // which pointed it away from the teeth and left it floating in space.
  const s = new THREE.Shape()
  s.moveTo(0, 0.075)
  s.lineTo(-0.78, 0.035)
  s.lineTo(-0.86, 0)
  s.lineTo(-0.78, -0.035)
  s.lineTo(0, -0.075)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.1, bevelEnabled: true, bevelSize: 0.008,
    bevelThickness: 0.008, bevelSegments: 2,
  })
  g.translate(0, 0, -0.05)
  return g
}

/** A tumbler ring: an annulus with a notch cut out of it. When every ring's
 *  notch lines up, the beam passes. QuizNest — knowledge either aligns or it
 *  does not. */
export function tumblerGeometry(rOuter: number, rInner: number, notch = 0.34) {
  const s = new THREE.Shape()
  const a0 = -Math.PI / 2 + notch / 2
  const a1 = -Math.PI / 2 - notch / 2 + Math.PI * 2
  s.absarc(0, 0, rOuter, a0, a1, false)
  s.absarc(0, 0, rInner, a1, a0, true)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.09, bevelEnabled: true, bevelSize: 0.008,
    bevelThickness: 0.008, bevelSegments: 2, curveSegments: 64,
  })
  g.center()
  return g
}
