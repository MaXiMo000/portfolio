import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, AdaptiveDpr } from '@react-three/drei'
import {
  EffectComposer, Bloom, DepthOfField, Noise, Vignette, ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import Instrument from './Instrument'
import { I } from '../lib/pointer'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

class ViewportObserver {
  private els = new Set<Element>()
  private cb: (entries: { target: Element; contentRect: DOMRectReadOnly }[]) => void
  constructor(cb: (entries: { target: Element; contentRect: DOMRectReadOnly }[]) => void) {
    this.cb = cb
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


/**
 * The environment is built from lightformers rather than an HDRI file.
 * On machined metal the environment *is* the material, and shaped softboxes
 * give sharper, art-directable specular streaks than a photographic probe —
 * while costing zero bytes and needing no third-party origin.
 */
function Studio() {
  return (
    <Environment resolution={256}>
      {/* long key streak: the highlight that rakes across the turned faces */}
      <Lightformer form="rect" intensity={14} color="#EAF2FF"
        position={[-3, 2.6, 2]} scale={[9, 0.4, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={8} color="#CFE0F5"
        position={[3.4, 1.2, 1.6]} scale={[5, 0.22, 1]} target={[0, 0, 0]} />
      {/* cool fill from behind, separates the silhouette from the void */}
      <Lightformer form="rect" intensity={5} color="#7E93B5"
        position={[0, -1.8, -4]} scale={[10, 3, 1]} target={[0, 0, 0]} />
      {/* the one warm bounce — keeps the alloy from reading blue-dead */}
      <Lightformer form="circle" intensity={2.4} color="#FFD9A8"
        position={[4.2, -1.4, 2.4]} scale={3} target={[0, 0, 0]} />
      <Lightformer form="ring" intensity={2} color="#FFFFFF"
        position={[-2.2, -2.4, 1.2]} scale={2.4} target={[0, 0, 0]} />
    </Environment>
  )
}

/** Fires once the renderer has genuinely put frames on screen, so the drawing
 *  is only removed when there is something real behind it. */
function Ready({ onReady }: { onReady: () => void }) {
  const seen = useRef(0)
  useFrame(() => {
    if (seen.current < 3 && ++seen.current === 3) onReady()
  })
  return null
}

/** Resolves the image out of black rather than cutting to it. */
function Exposure() {
  useFrame(({ gl }) => { gl.toneMappingExposure = I.v * 1.15 })
  return null
}

export default function Scene({ onReady }: { onReady: () => void }) {
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
        gl.toneMappingExposure = 0
      }}
    >
      <color attach="background" args={['#08090C']} />
      <Studio />
      <directionalLight position={[3.5, 4, 2.5]} intensity={0.6} />

      <Instrument />
      <Exposure />
      <Ready onReady={onReady} />

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={14} blur={3} far={5} />

      <EffectComposer multisampling={0}>
        <DepthOfField focusDistance={0.02} focalLength={0.16} bokehScale={2.2} />
        <Bloom intensity={0.55} luminanceThreshold={0.7} luminanceSmoothing={0.35} mipmapBlur />
        <ChromaticAberration offset={new THREE.Vector2(0.0007, 0.0007)} />
        <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.24} darkness={0.82} />
      </EffectComposer>
      <AdaptiveDpr />
    </Canvas>
  )
}
