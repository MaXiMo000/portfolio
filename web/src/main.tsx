import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'

// No StrictMode: its double-mount tears down and recreates the WebGL context,
// which the compositor reports as a lost context and R3F cannot recover from.
const root = document.getElementById('root')!
if (root.firstChild) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)
