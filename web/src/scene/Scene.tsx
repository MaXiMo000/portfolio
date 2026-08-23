import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, AdaptiveDpr } from '@react-three/drei'
import {
  EffectComposer, Bloom, DepthOfField, Noise, Vignette, ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import Instrument from './Instrument'

class ViewportObserver {
  private els = new Set<Element>()
  constructor(private cb: (entries: { target: Element; contentRect: DOMRectReadOnly }[]) => void) {
    window.addEventListener('resize', this.fire)
    window.addEventListener('orientationchange', this.fire)
  }
  private fire = () => {
    this.cb([...this.els].map((target) => ({ target, contentRect: target.getBoundingClientRect() })))
  }
  observe(el: Element) {
    this.els.add(el)
    this.fire()                       // synchronously, inside R3F's layout effect
    requestAnimationFrame(this.fire)  // and again once layout has settled
    setTimeout(this.fire, 0)
  }
  unobserve(el: Element) { this.els.delete(el) }
  disconnect() {
    this.els.clear()
    window.removeEventListener('resize', this.fire)
    window.removeEventListener('orientationchange', this.fire)
  }
}

export default function Scene() {
  return (
    <Canvas
      // inline, not a class: styles.css is injected after mount and R3F would
      // measure the container at zero height and never start the loop.
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      dpr={[1, 1.5]}
      resize={{ polyfill: ViewportObserver as never }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 38, position: [0, 0, 3.1] }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.15
      }}
    >
      <color attach="background" args={['#08090C']} />
      <Studio />
      <directionalLight position={[3.5, 4, 2.5]} intensity={0.6} />

      <Instrument />

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={14} blur={3} far={5} />

      <EffectComposer multisampling={0}>
        <DepthOfField focusDistance={0.02} focalLength={0.16} bokehScale={2.2} />
        <Bloom intensity={0.55} luminanceThreshold={0.7} luminanceSmoothing={0.35} mipmapBlur />
        <ChromaticAberration offset={[0.0007, 0.0007]} blendFunction={BlendFunction.NORMAL} />
        <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.24} darkness={0.82} />
      </EffectComposer>
      <AdaptiveDpr />
    </Canvas>
  )
}
