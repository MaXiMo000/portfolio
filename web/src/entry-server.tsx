import { renderToString } from 'react-dom/server'
import App from './App'

/** Build-time only. `allowed` starts false, so no canvas is rendered here and
 *  the client's first render matches exactly — no hydration mismatch. */
export function render() {
  return renderToString(<App />)
}
