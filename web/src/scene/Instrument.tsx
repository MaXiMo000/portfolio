import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, damp } from '../lib/scroll'
import { P, I } from '../lib/pointer'
import { NUDGE } from '../lib/nudge'
import { ratchetGeometry, housingGeometry, pawlGeometry, tumblerGeometry } from './geometry'

const BEAM = '#86E9DE'
const ESCALATE = '#E8873B'
const TEETH = 24
const STEP = (Math.PI * 2) / TEETH
const SPARKS = 56
const HOT = new THREE.Color('#FFE3B4')   // forward: struck metal
const COLD = new THREE.Color('#9FD8FF')  // reverse: the pawl skating, no bite
// pawl pivot sits outside the wheel; the arm reaches back to r ~0.94, just
// inside the tooth tips, so it actually rides the flank
const PIVOT = { x: 1.6, y: 0.55, z: 0.05 }
const CONTACT = new THREE.Vector3(0.76, 0.55, 0.05)

/** One alloy for the whole page. The metal is read from the environment,
 *  not from lights — that is why the HDRI is the expensive asset. */
function useAlloy() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#AEB8C6',
        metalness: 0.92,
        roughness: 0.26,
        envMapIntensity: 2.1,
      }),
    [],
  )
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Scroll position as one continuous number across the whole page. */
export const flow = () => S.i + S.t

/**
 * Presence, not visibility. Weight peaks at the middle of a section and falls
 * linearly to zero at its neighbours' middles, so at every boundary the two
 * mechanisms are each half-present and genuinely hand over.
 *
 * The previous version damped toward a binary "is this the active section",
 * which made mechanisms pop in and out at full size — a swap, not a morph.
 */
function useWeight(index: number) {
  const w = useRef(index === 0 ? 1 : 0)
  useFrame((_, dt) => {
    const d = Math.abs(flow() - (index + 0.5))
    const target = smoothstep(THREE.MathUtils.clamp(1 - d, 0, 1))
    w.current = damp(w.current, target, 9, Math.min(dt, 0.05))
  })
  return w
}

/** Departing mechanisms fall back into the dark; arriving ones come forward.
 *  Without this the overlap at a boundary reads as clutter instead of depth. */
function stage(g: THREE.Group, k: number, scale: number) {
  g.visible = k > 0.005
  g.scale.setScalar(k * scale)
  g.position.z = (1 - k) * -1.6
}

/* ---------------------------------------------------------------- 00 / 06 */
const PETALS = 8

/**
 * The housing does not fade out — it opens. Eight wedges of the same lathed
 * profile hinge outward as the next mechanism arrives inside them, driven by
 * that mechanism's own weight. This is the morph: one object reconfiguring,
 * never two objects swapping.
 */
function Housing({ index, opensWith }: { index: number; opensWith: number }) {
  const g = useRef<THREE.Group>(null!)
  const shell = useRef<THREE.Group>(null!)
  const alloy = useAlloy()
  const w = useWeight(index)

  const petals = useMemo(
    () =>
      Array.from({ length: PETALS }, (_, i) => {
        const span = (Math.PI * 2) / PETALS
        const mid = i * span + span / 2
        return {
          geo: housingGeometry(i * span, span),
          // LatheGeometry places vertices at (x·sin φ, y, x·cos φ), so the
          // outward radial for this wedge is (sin, 0, cos) — not (cos, 0, -sin),
          // which was 90° off and scattered the petals instead of blooming them.
          radial: new THREE.Vector3(Math.sin(mid), 0, Math.cos(mid)),
          // hinge about the tangent so each petal tips outward in place
          hinge: new THREE.Vector3(Math.cos(mid), 0, -Math.sin(mid)),
          delay: i * 0.045,
        }
      }),
    [],
  )

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    stage(g.current, w.current, 1.35)

    // how far the neighbouring mechanism has arrived == how far we are open
    const open = smoothstep(
      THREE.MathUtils.clamp(1 - Math.abs(flow() - (opensWith + 0.5)), 0, 1),
    )
    shell.current.children.forEach((petal, i) => {
      const p = petals[i]
      // they bloom in sequence, not all at once
      const o = smoothstep(THREE.MathUtils.clamp((open - p.delay) / 0.7, 0, 1))
      petal.position.copy(p.radial).multiplyScalar(o * 0.44)
      petal.quaternion.setFromAxisAngle(p.hinge, o * 0.62)
    })

    g.current.rotation.y += d * 0.12
    g.current.rotation.x = -0.22 + Math.sin(state.clock.elapsedTime * 0.25) * 0.04
  })

  return (
    <group ref={g}>
      <group ref={shell}>
        {petals.map((p, i) => (
          <mesh key={i} geometry={p.geo} material={alloy} castShadow receiveShadow />
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.605, 0.006, 8, 128]} />
        <meshStandardMaterial color="#0A0C10" metalness={0.4} roughness={0.9} />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------------- 01 */
function Ratchet({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const wheel = useRef<THREE.Mesh>(null!)
  const pawl = useRef<THREE.Group>(null!)
  const sparks = useRef<THREE.InstancedMesh>(null!)
  const angle = useRef(0)
  const settled = useRef(0)
  const lastT = useRef(0)
  const armed = useRef(false)
  const advanced = useRef(0)
  const seenNudge = useRef(0)
  const tooth = useRef(0)
  const release = useRef(0)
  const alloy = useAlloy()
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#C9A45E', metalness: 1, roughness: 0.3, envMapIntensity: 1.3,
    }), [],
  )
  const geo = useMemo(() => ratchetGeometry(TEETH), [])
  const pawlGeo = useMemo(pawlGeometry, [])
  const w = useWeight(index)

  // Struck metal throws sparks. Warm white, not the cyan measurement light —
  // this is a mechanical event, not a reading.
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const sparkState = useMemo(
    () => Array.from({ length: SPARKS }, () => ({
      life: 0, decay: 3, p: new THREE.Vector3(), v: new THREE.Vector3(),
    })),
    [],
  )

  /**
   * Two spark characters, because the two directions are different events.
   *  forward — the pawl bites a tooth: few, fast, hot, thrown hard one way.
   *  reverse — the pawl is lifted and skating over the tooth backs: many,
   *            slower, cold, scattered. A graze, not a strike.
   */
  const emit = (reverse: boolean) => {
    const n = reverse ? 5 : 9
    const col = reverse ? COLD : HOT
    let spawned = 0
    for (let i = 0; i < SPARKS; i++) {
      const sp = sparkState[i]
      if (sp.life > 0) continue
      sp.life = 1
      sp.decay = reverse ? 4.4 : 2.9
      sp.p.set(CONTACT.x, CONTACT.y, CONTACT.z + (Math.random() - 0.5) * 0.12)
      const a = reverse
        ? 1.5 + (Math.random() - 0.5) * 2.4
        : -1.15 + (Math.random() - 0.5) * 1.5
      const speed = reverse ? 0.5 + Math.random() * 1.0 : 1.1 + Math.random() * 2.2
      sp.v.set(Math.cos(a) * speed, Math.sin(a) * speed, (Math.random() - 0.5) * 0.9)
      sparks.current?.setColorAt(i, col)
      if (++spawned >= n) break
    }
    if (sparks.current?.instanceColor) sparks.current.instanceColor.needsUpdate = true
  }

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const k = w.current
    stage(g.current, k, 1.5)

    // Quantised: scroll advances exactly one tooth at a time.
    if (S.i === index) {
      // Re-entering must not replay old travel, so re-arm against the current
      // position rather than the one we left at.
      if (!armed.current) { lastT.current = S.t; armed.current = true }
      const delta = S.t - lastT.current
      lastT.current = S.t
      // Accumulate *travel* rather than reading absolute progress. Reading S.t
      // directly meant the wheel maxed out on the first scroll through and
      // never moved again on any later pass.
      // Forward, the pawl is engaged: quantised, one tooth at a time.
      // Backward, the pawl LIFTS and the wheel is released — it back-drives
      // smoothly instead of clicking. A ratchet does not run in reverse; it
      // gets let go. That keeps the copy honest and makes the two directions
      // genuinely different mechanical events rather than one played twice.
      if (delta > 0) {
        advanced.current += delta
        release.current = damp(release.current, 0, 10, d)
      } else if (delta < 0) {
        advanced.current = Math.max(0, advanced.current + delta)
        release.current = damp(release.current, 1, 7, d)
      } else {
        release.current = damp(release.current, 0, 3, d)
      }

      const travel = advanced.current * TEETH * 0.6
      settled.current = release.current > 0.5
        ? travel * STEP              // released: continuous slip
        : Math.floor(travel) * STEP  // engaged: snaps tooth to tooth

      const t = Math.floor(travel)
      if (t !== tooth.current) {
        emit(t < tooth.current)
        tooth.current = t
      }
    } else {
      armed.current = false
      release.current = damp(release.current, 0, 4, d)
    }

    // hovering "Open the repo" clicks it one tooth
    if (NUDGE.section === index && NUDGE.count !== seenNudge.current) {
      seenNudge.current = NUDGE.count
      // a hover is a forward bite, so it advances the accumulator too —
      // otherwise the next scroll would undo it
      advanced.current += 1 / (TEETH * 0.6)
      tooth.current = Math.floor(advanced.current * TEETH * 0.6)
      settled.current += STEP
      emit(false)
    }
    angle.current = damp(angle.current, settled.current, 11, d)
    wheel.current.rotation.z = angle.current

    // engaged: rides up the flank and drops into the valley.
    // released: swung clear of the tooth tips, chattering as it skates.
    const phase = ((angle.current % STEP) + STEP) % STEP / STEP
    const ride = Math.sin(phase * Math.PI) * 0.11
    const skate = Math.sin(phase * Math.PI * 6) * 0.03 * release.current
    pawl.current.rotation.z = -0.04 + ride + skate - release.current * 0.24

    // sparks: ballistic, short-lived, stretched along their own velocity
    for (let i = 0; i < SPARKS; i++) {
      const sp = sparkState[i]
      if (sp.life <= 0) { dummy.scale.setScalar(0.0001) }
      else {
        sp.life -= d * sp.decay
        sp.v.y -= 5.2 * d
        sp.v.multiplyScalar(1 - 1.6 * d)
        sp.p.addScaledVector(sp.v, d)
        dummy.position.copy(sp.p)
        dummy.lookAt(sp.p.clone().add(sp.v))
        const l = Math.max(sp.life, 0)
        dummy.scale.set(0.012 * l, 0.012 * l, 0.05 + sp.v.length() * 0.035 * l)
      }
      dummy.updateMatrix()
      sparks.current.setMatrixAt(i, dummy.matrix)
    }
    sparks.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={g}>
      <mesh ref={wheel} geometry={geo} material={alloy} castShadow receiveShadow />
      <group position={[PIVOT.x, PIVOT.y, PIVOT.z]}>
        <group ref={pawl}>
          <mesh geometry={pawlGeo} material={brass} castShadow />
        </group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.17, 24]} />
          <primitive object={brass} attach="material" />
        </mesh>
      </group>

      <instancedMesh ref={sparks} args={[undefined, undefined, SPARKS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#FFE3B4" toneMapped={false}
          blending={THREE.AdditiveBlending} transparent depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}

/* --------------------------------------------------------------------- 02 */
const CHIPS = 180
function Rotor({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const inst = useRef<THREE.InstancedMesh>(null!)
  const spin = useRef(0)
  const alloy = useAlloy()
  const w = useWeight(index)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Each chip is one transaction. A third of them actually recur.
  const chips = useMemo(
    () =>
      Array.from({ length: CHIPS }, (_, i) => {
        const recurring = i % 3 === 0
        return {
          recurring,
          ring: recurring ? 0.62 + (i % 3 === 0 ? (i % 9) / 9 : 0) * 0.9 : 0,
          chaos: new THREE.Vector3(
            (Math.random() - 0.5) * 3.2,
            (Math.random() - 0.5) * 2.2,
            (Math.random() - 0.5) * 3.2,
          ),
          a: Math.random() * Math.PI * 2,
          drift: 2.4 + Math.random() * 2.2,
          spinOff: Math.random() * Math.PI,
        }
      }),
    [],
  )

  useFrame((state, dt) => {
    const k = w.current
    stage(g.current, k, 1)
    const t = S.i === index ? S.t : 0
    spin.current += dt * (0.35 + t * 3.2)

    chips.forEach((c, i) => {
      const a = c.a + spin.current * (c.recurring ? 1 : 0.4)
      // recurring charges lock into clean concentric rings;
      // the noise is flung outward and dims.
      const r = c.recurring
        ? THREE.MathUtils.lerp(c.chaos.length(), c.ring + 0.55, t)
        : THREE.MathUtils.lerp(c.chaos.length(), c.drift, t * t)
      const y = THREE.MathUtils.lerp(c.chaos.y, c.recurring ? 0 : c.chaos.y * 2.4, t)
      dummy.position.set(r * Math.cos(a), y, r * Math.sin(a))
      dummy.rotation.set(0, -a + c.spinOff, c.recurring ? 0 : c.spinOff)
      const s = c.recurring ? 0.075 : THREE.MathUtils.lerp(0.055, 0.02, t)
      dummy.scale.set(s * 2.6, s * 0.32, s)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
    g.current.rotation.x = -0.42 + Math.sin(state.clock.elapsedTime * 0.2) * 0.03
  })

  return (
    <group ref={g}>
      <instancedMesh ref={inst} args={[undefined, undefined, CHIPS]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={alloy} attach="material" />
      </instancedMesh>
      {/* one sweep light rotating with the rotor */}
      <pointLight color={BEAM} intensity={6} distance={5} position={[1.6, 0.6, 1.2]} />
    </group>
  )
}

/* --------------------------------------------------------------------- 03 */
const BANDS = 7
function Spectrometer({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const bands = useRef<THREE.Group>(null!)
  const alloy = useAlloy()
  const w = useWeight(index)

  const rows = useMemo(
    () =>
      Array.from({ length: BANDS }, (_, i) => ({
        // one band never resolves — it goes to a human
        escalates: i === 4,
        spread: (i - (BANDS - 1) / 2) * 0.16,
        row: (i - (BANDS - 1) / 2) * 0.34,
      })),
    [],
  )

  useFrame((state) => {
    const k = w.current
    stage(g.current, k, 1.15)
    const t = S.i === index ? S.t : 0
    bands.current.children.forEach((b, i) => {
      const r = rows[i]
      // continuous spectrum snaps to discrete, labelled rows
      const snap = r.escalates ? Math.min(t, 0.55) : t
      b.position.y = THREE.MathUtils.lerp(r.spread, r.row, snap)
      b.position.x = THREE.MathUtils.lerp(1.1, 1.95, snap)
      b.scale.x = THREE.MathUtils.lerp(0.5, 1, snap)
    })
    g.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.06
  })

  return (
    <group ref={g}>
      {/* the prism */}
      <mesh rotation={[0, 0, Math.PI]} position={[0.1, 0, 0]}>
        <cylinderGeometry args={[0, 0.62, 0.62, 3]} />
        <meshPhysicalMaterial
          transmission={0.94} thickness={0.9} roughness={0.04}
          ior={1.62} color="#EAF6FF" metalness={0}
        />
      </mesh>
      {/* incoming beam */}
      <mesh position={[-1.5, 0, 0]}>
        <boxGeometry args={[2, 0.022, 0.022]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <group ref={bands}>
        {rows.map((r, i) => (
          <mesh key={i} position={[1.1, r.spread, 0]}>
            <boxGeometry args={[1.5, 0.03, 0.03]} />
            <meshBasicMaterial color={r.escalates ? ESCALATE : BEAM} />
          </mesh>
        ))}
      </group>
      <mesh position={[2.9, 0, -0.12]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.06, 2.3, 1.1]} />
        <primitive object={alloy} attach="material" />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------------- 04 */
const RINGS = 5
function Tumbler({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const rings = useRef<THREE.Group>(null!)
  const beam = useRef<THREE.Mesh>(null!)
  const alloy = useAlloy()
  const w = useWeight(index)

  const spec = useMemo(
    () =>
      Array.from({ length: RINGS }, (_, i) => ({
        geo: tumblerGeometry(1.22 - i * 0.17, 1.22 - i * 0.17 - 0.13),
        z: (i - (RINGS - 1) / 2) * 0.13,
        from: (i * 2.399) % (Math.PI * 2) + 0.7, // scrambled start
        delay: i * 0.11,                          // they align in sequence
      })),
    [],
  )

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const k = w.current
    stage(g.current, k, 1.25)
    const t = S.i === index ? S.t : 0

    let aligned = 0
    rings.current.children.forEach((r, i) => {
      const sp = spec[i]
      const local = THREE.MathUtils.clamp((t - sp.delay) / 0.45, 0, 1)
      const e = local * local * (3 - 2 * local)
      r.rotation.z = damp(r.rotation.z, sp.from * (1 - e), 9, d)
      if (Math.abs(r.rotation.z) < 0.05) aligned++
    })

    // the beam only passes once every notch lines up
    const open = aligned / RINGS
    const m = beam.current.material as THREE.MeshBasicMaterial
    m.opacity = damp(m.opacity, open > 0.99 ? 1 : 0.05, 6, d)
    beam.current.scale.y = damp(beam.current.scale.y, 0.3 + open * 0.7, 6, d)
    g.current.rotation.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.16) * 0.05
    g.current.rotation.x = -0.22
  })

  return (
    <group ref={g}>
      <group ref={rings}>
        {spec.map((sp, i) => (
          <mesh key={i} geometry={sp.geo} material={alloy} position={[0, 0, sp.z]} castShadow />
        ))}
      </group>
      <mesh ref={beam} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 3.4, 16]} />
        <meshBasicMaterial color={BEAM} transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------------- 05 */
const DOSES = 5
function Manifold({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const pistons = useRef<THREE.Group>(null!)
  const beads = useRef<THREE.Group>(null!)
  const alloy = useAlloy()
  const w = useWeight(index)

  // each piston doses a measured amount; they fire in sequence, then converge
  const spec = useMemo(
    () =>
      Array.from({ length: DOSES }, (_, i) => ({
        x: (i - (DOSES - 1) / 2) * 0.46,
        delay: i * 0.13,
        travel: 0.34 + (i % 2) * 0.1,
      })),
    [],
  )

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const k = w.current
    stage(g.current, k, 1.1)
    const t = S.i === index ? S.t : 0

    pistons.current.children.forEach((p, i) => {
      const sp = spec[i]
      const local = THREE.MathUtils.clamp((t - sp.delay) / 0.4, 0, 1)
      const e = 1 - Math.pow(1 - local, 3)
      p.position.y = damp(p.position.y, 0.72 - e * sp.travel, 9, d)
    })

    // the dose falls, then slides along the collector to the single output
    beads.current.children.forEach((b, i) => {
      const sp = spec[i]
      const local = THREE.MathUtils.clamp((t - sp.delay - 0.12) / 0.5, 0, 1)
      const fall = Math.min(local * 2, 1)
      const slide = THREE.MathUtils.clamp((local - 0.5) * 2, 0, 1)
      b.position.y = 0.34 - fall * 0.86
      b.position.x = THREE.MathUtils.lerp(sp.x, 0, slide * slide)
      b.scale.setScalar(local > 0.01 ? 1 : 0.001)
      ;((b as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - slide * 0.35
    })

    g.current.rotation.y = 0.22 + Math.sin(state.clock.elapsedTime * 0.15) * 0.05
    g.current.rotation.x = -0.16
  })

  return (
    <group ref={g}>
      <group ref={pistons}>
        {spec.map((sp, i) => (
          <group key={i} position={[sp.x, 0.72, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.145, 0.145, 0.62, 32]} />
              <primitive object={alloy} attach="material" />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
              <primitive object={alloy} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      <group ref={beads}>
        {spec.map((sp, i) => (
          <mesh key={i} position={[sp.x, 0.34, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={BEAM} transparent opacity={1} />
          </mesh>
        ))}
      </group>

      {/* the collector: five measured inputs, one output */}
      <mesh position={[0, -0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.1, 0.5]} />
        <primitive object={alloy} attach="material" />
      </mesh>
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.13, 0.19, 0.6, 32]} />
        <primitive object={alloy} attach="material" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------------ */
export default function Instrument() {
  const rig = useRef<THREE.Group>(null!)

  // camera keyframes, one per section — eased, never linear
  const KEYS: [number, number, number][] = [
    [0, 0, 3.3],      // 00 housing, close
    [0.95, 0.8, 4.3], // 01 ratchet — raked, so the teeth and pawl read
    [0, 0.9, 5.4],    // 02 rotor, from above
    [0.2, 0, 4.8],    // 03 spectrometer, side on
    [0, 0.15, 4.3],   // 04 tumbler, down the barrel
    [0, 0.35, 4.6],   // 05 manifold
    [0, 0, 3.6],      // 06 housing, closed again
  ]

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const a = KEYS[S.i] ?? KEYS[0]
    const b = KEYS[Math.min(S.i + 1, KEYS.length - 1)]
    const e = S.t * S.t * (3 - 2 * S.t) // smoothstep
    const x = THREE.MathUtils.lerp(a[0], b[0], e * 0.35)
    const y = THREE.MathUtils.lerp(a[1], b[1], e * 0.35)
    const z = THREE.MathUtils.lerp(a[2], b[2], e * 0.35)
    // the entrance dollies in; afterwards I.v is 1 and contributes nothing
    const intro = (1 - I.v) * 1.5
    // Pointer parallax. Turning the object against a fixed environment is what
    // rakes the specular across the machined faces — the light appears to move
    // because the reflection does.
    state.camera.position.x = damp(state.camera.position.x, x + P.x * 0.22, 3, d)
    state.camera.position.y = damp(state.camera.position.y, y - P.y * 0.14, 3, d)
    state.camera.position.z = damp(state.camera.position.z, z + intro, 3, d)
    rig.current.rotation.y = damp(rig.current.rotation.y, S.t * 0.3 + P.x * 0.16, 2.5, d)
    rig.current.rotation.x = damp(rig.current.rotation.x, -P.y * 0.1, 2.5, d)
    state.camera.lookAt(0.55, 0, 0)
  })

  return (
    // right of centre, cropped: the copy owns the left third
    <group ref={rig} position={[1.15, 0.05, 0]} scale={0.78}>
      <Housing index={0} opensWith={1} />
      <Ratchet index={1} />
      <Rotor index={2} />
      <Spectrometer index={3} />
      <Tumbler index={4} />
      <Manifold index={5} />
      <Housing index={6} opensWith={5} />
    </group>
  )
}
