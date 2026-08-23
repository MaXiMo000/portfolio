import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, damp } from '../lib/scroll'
import { ratchetGeometry, housingGeometry, pawlGeometry } from './geometry'

const BEAM = '#86E9DE'
const ESCALATE = '#E8873B'
const TEETH = 24
const STEP = (Math.PI * 2) / TEETH

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

/** Damped visibility weight: 1 while this section is active, 0 otherwise.
 *  Nothing ever cuts — the instrument reconfigures. */
function useWeight(index: number) {
  const w = useRef(index === 0 ? 1 : 0)
  useFrame((_, dt) => {
    w.current = damp(w.current, S.i === index ? 1 : 0, 6, Math.min(dt, 0.05))
  })
  return w
}

/* ---------------------------------------------------------------- 00 / 06 */
function Housing({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const alloy = useAlloy()
  const geo = useMemo(housingGeometry, [])
  const w = useWeight(index)

  useFrame((state, dt) => {
    const k = w.current
    g.current.visible = k > 0.01
    g.current.scale.setScalar(k * 1.35)
    // slow drift; the seam catches the key light once per rotation
    g.current.rotation.y += dt * 0.12
    g.current.rotation.x = -0.22 + Math.sin(state.clock.elapsedTime * 0.25) * 0.04
  })

  return (
    <group ref={g}>
      <mesh geometry={geo} material={alloy} castShadow receiveShadow />
      {/* the seam */}
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
  const flash = useRef<THREE.PointLight>(null!)
  const angle = useRef(0)
  const settled = useRef(0)
  const alloy = useAlloy()
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#C9A45E', metalness: 1, roughness: 0.3, envMapIntensity: 1.3,
    }), [],
  )
  const geo = useMemo(() => ratchetGeometry(TEETH), [])
  const pawlGeo = useMemo(pawlGeometry, [])
  const w = useWeight(index)

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    const k = w.current
    g.current.visible = k > 0.01
    g.current.scale.setScalar(k * 1.5)

    // Quantised: scroll advances exactly one tooth at a time.
    if (S.i === index) {
      const target = Math.floor(S.t * TEETH * 0.6) * STEP
      // The wheel NEVER reverses. Scroll back and the camera returns; the
      // mechanism holds. That is the entire argument of carabiner.
      if (target > settled.current) {
        settled.current = target
        if (flash.current) flash.current.intensity = 14
      }
    }
    angle.current = damp(angle.current, settled.current, 11, d)
    wheel.current.rotation.z = angle.current

    // pawl rides the tooth it is holding, then snaps back against the spring
    const phase = (angle.current % STEP) / STEP
    pawl.current.rotation.z = -0.34 + Math.sin(phase * Math.PI) * 0.13
    if (flash.current) flash.current.intensity = damp(flash.current.intensity, 0, 9, d)
  })

  return (
    <group ref={g}>
      <mesh ref={wheel} geometry={geo} material={alloy} castShadow receiveShadow />
      <group position={[1.28, 0.34, 0.04]}>
        <group ref={pawl}>
          <mesh geometry={pawlGeo} material={brass} castShadow />
        </group>
        <mesh>
          <cylinderGeometry args={[0.085, 0.085, 0.16, 24]} />
          <primitive object={brass} attach="material" />
        </mesh>
      </group>
      <pointLight ref={flash} color={BEAM} distance={2.4} position={[0.9, 0.2, 0.4]} />
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
    g.current.visible = k > 0.01
    g.current.scale.setScalar(k)
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

  useFrame((state, dt) => {
    const k = w.current
    g.current.visible = k > 0.01
    g.current.scale.setScalar(k * 1.15)
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
function Plates({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null!)
  const alloy = useAlloy()
  const w = useWeight(index)
  useFrame((_, dt) => {
    const k = w.current
    g.current.visible = k > 0.01
    g.current.scale.setScalar(k * 1.1)
    const t = S.i === index ? S.t : 0
    g.current.rotation.y = damp(g.current.rotation.y, -0.4 + t * 4.2, 5, Math.min(dt, 0.05))
  })
  return (
    <group ref={g} rotation={[-0.12, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]}>
          <mesh position={[1.35, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[1.5, 0.95, 0.05]} />
            <primitive object={alloy} attach="material" />
          </mesh>
        </group>
      ))}
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 2.1, 24]} />
        <primitive object={alloy} attach="material" />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------------- 05 */
function Gauge({ index, value = 0.98 }: { index: number; value?: number }) {
  const g = useRef<THREE.Group>(null!)
  const needle = useRef<THREE.Group>(null!)
  const alloy = useAlloy()
  const w = useWeight(index)
  useFrame((_, dt) => {
    const k = w.current
    g.current.visible = k > 0.01
    g.current.scale.setScalar(k * 1.3)
    const t = S.i === index ? S.t : 0
    // sweeps, overshoots slightly, settles on the real measured number
    const target = -2.2 + Math.min(t * 1.35, 1) * value * 4.4
    needle.current.rotation.z = damp(needle.current.rotation.z, target, 7, Math.min(dt, 0.05))
  })
  return (
    <group ref={g} rotation={[-0.1, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.15, 1.15, 0.14, 96]} />
        <primitive object={alloy} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.02, 10, 120, Math.PI * 1.4]} />
        <meshBasicMaterial color={BEAM} />
      </mesh>
      <group ref={needle} position={[0, 0, 0.12]}>
        <mesh position={[0.44, 0, 0]}>
          <boxGeometry args={[0.9, 0.028, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.13]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
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
    [0, 0, 3.1],
    [0.35, 0.1, 4.4],
    [0, 0.9, 5.4],
    [0.2, 0, 4.8],
    [0, 0.25, 5.0],
    [0, 0, 4.2],
    [0, 0, 3.1],
  ]

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const a = KEYS[S.i] ?? KEYS[0]
    const b = KEYS[Math.min(S.i + 1, KEYS.length - 1)]
    const e = S.t * S.t * (3 - 2 * S.t) // smoothstep
    const x = THREE.MathUtils.lerp(a[0], b[0], e * 0.35)
    const y = THREE.MathUtils.lerp(a[1], b[1], e * 0.35)
    const z = THREE.MathUtils.lerp(a[2], b[2], e * 0.35)
    state.camera.position.x = damp(state.camera.position.x, x, 3, d)
    state.camera.position.y = damp(state.camera.position.y, y, 3, d)
    state.camera.position.z = damp(state.camera.position.z, z, 3, d)
    rig.current.rotation.y = damp(rig.current.rotation.y, S.t * 0.3, 2.5, d)
    state.camera.lookAt(0.55, 0, 0)
  })

  return (
    // right of centre, cropped: the copy owns the left third
    <group ref={rig} position={[1.15, 0.05, 0]} scale={0.78}>
      <Housing index={0} />
      <Ratchet index={1} />
      <Rotor index={2} />
      <Spectrometer index={3} />
      <Plates index={4} />
      <Gauge index={5} />
      <Housing index={6} />
    </group>
  )
}
