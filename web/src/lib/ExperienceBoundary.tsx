import { Component, type ReactNode } from 'react'

/**
 * The experience layer is allowed to fail. The page is not.
 * A lost WebGL context throws out of R3F's <Canvas>; without this boundary it
 * unmounts the whole app and the visitor is left staring at a black screen —
 * which would break the one promise the site actually makes.
 */
export default class ExperienceBoundary extends Component<
  { children: ReactNode },
  { dead: boolean }
> {
  state = { dead: false }

  static getDerivedStateFromError() {
    return { dead: true }
  }

  componentDidCatch(err: unknown) {
    console.warn('[experience] disabled after an error; content is unaffected', err)
  }

  render() {
    return this.state.dead ? null : this.props.children
  }
}
