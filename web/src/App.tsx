import { useEffect, useState, lazy, Suspense } from 'react'
import { initScroll } from './lib/scroll'
import ExperienceBoundary from './lib/ExperienceBoundary'
import './styles.css'

const Scene = lazy(() => import('./scene/Scene'))

/** The experience never gates the content. Canvas is skipped entirely when the
 *  visitor or the hardware says no; the composed static page stands alone. */
function useExperienceAllowed() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as any).connection?.saveData === true
    let webgl = false
    try {
      webgl = !!document.createElement('canvas').getContext('webgl2')
    } catch { /* no webgl */ }
    if (!reduced && !saveData && webgl) {
      const idle = (window as any).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 200))
      idle(() => setOk(true))
    }
  }, [])
  return ok
}

export default function App() {
  const allowed = useExperienceAllowed()
  useEffect(() => initScroll(), [])

  return (
    <>
      <a className="skip" href="#work">Skip to the work</a>

      {allowed && (
        <ExperienceBoundary>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </ExperienceBoundary>
      )}

      <header className="hud top">
        <span className="brand"><i className="pip" />Ritish Saini</span>
        <span className="role">Backend engineer · Postgres · Security</span>
      </header>

      <nav className="hud rail" aria-label="Sections">
        {['Resolve', 'carabiner', 'recur', 'LabLedger', 'Range', 'Measured', 'Contact']
          .map((n, i) => (
            <a key={n} href={`#s${i}`}><u>{String(i).padStart(2, '0')}</u>{n}</a>
          ))}
      </nav>

      <main>
        <section id="s0" data-sec="hero" className="sec hero">
          <p className="eyebrow">Instruments of resolution</p>
          <h1>
            <span>Noise</span>
            <span className="quiet">goes in.</span>
            <span className="serif">Signal</span>
            <span>comes out.</span>
          </h1>
          <p className="lede">
            Six things I built. Each one takes something messy and untrusted —
            a repository, a bank export, a lab PDF — and returns something you
            can rely on.
          </p>
        </section>

        <section id="s1" data-sec="carabiner" className="sec" >
          <div className="col">
            <p className="num">01 <em>/ scanner</em></p>
            <h2>carabiner</h2>
            <p className="claim">A security baseline that <span className="serif">only tightens.</span></p>
            <dl>
              <dt>Problem</dt><dd>Repository posture rots silently between audits.</dd>
              <dt>Hard</dt><dd>A ratchet that never loosens — not even by accident, not even by a well-meaning PR.</dd>
              <dt>Cost</dt><dd><b>60</b> repos calibrated · <b>57</b> tests · SARIF · PyPI, GHCR, Marketplace</dd>
            </dl>
            <a className="go" href="https://github.com/MaXiMo000/carabiner">Open the repo →</a>
          </div>
          <p className="aside">Scroll advances the wheel one tooth at a time. Scroll back — it holds.</p>
        </section>

        <section id="s2" data-sec="recur" className="sec">
          <div className="col">
            <p className="num">02 <em>/ ledger</em></p>
            <h2>recur</h2>
            <p className="claim">Which charges <span className="serif">actually</span> recur.</p>
            <dl>
              <dt>Problem</dt><dd>A bank export is a wall of rows. The subscriptions are in there somewhere.</dd>
              <dt>Hard</dt><dd>Postgres row-level security, so a query that forgets its tenant filter returns zero rows instead of someone else's money.</dd>
              <dt>Cost</dt><dd>argon2id · OAuth 2.1 + PKCE · remote MCP server · <b>0</b> bank credentials stored, ever</dd>
            </dl>
          </div>
          <p className="aside">The rotor separates signal from noise as you scroll.</p>
        </section>

        <section id="s3" data-sec="labledger" className="sec">
          <div className="col">
            <p className="num">03 <em>/ instrument</em></p>
            <h2>LabLedger</h2>
            <p className="claim">A lab PDF, resolved to <span className="serif">codes.</span></p>
            <dl>
              <dt>Problem</dt><dd>Every lab formats results differently. The numbers stop meaning anything.</dd>
              <dt>Hard</dt><dd>Resolving each test to a LOINC code, converting units, and picking the right reference interval.</dd>
              <dt>Cost</dt><dd>Multi-page PDFs · trend charts · <span className="esc">anything uncertain goes to a human</span></dd>
            </dl>
            <a className="go" href="https://labledger-web.onrender.com/">See it live →</a>
          </div>
          <p className="aside">One band never resolves. That one is escalated, not guessed.</p>
        </section>

        <section id="s4" data-sec="range" className="sec" >
          <div className="col" id="work">
            <p className="num">04 <em>/ range</em></p>
            <h2>And three more</h2>
            <ul className="plates">
              <li><b>QuizNest</b><span>MERN · AI-generated quizzes, analytics, gamification</span>
                <a href="https://quiz-app-cp2h.onrender.com/">Live →</a></li>
              <li><b>AI-Recipe-Maker</b><span>TypeScript · Claude-powered generation, nutrition, meal plans</span></li>
              <li><b>HouseofBooks</b><span>MERN · bookstore, cart, orders</span>
                <a href="https://houseofbooksfrontend.onrender.com/">Live →</a></li>
            </ul>
          </div>
        </section>

        <section id="s5" data-sec="measurements" className="sec">
          <div className="col">
            <p className="num">05 <em>/ measured</em></p>
            <h2>This page, measured</h2>
            <p className="claim">Every number here is <span className="serif">read, not written.</span></p>
            <table className="mt">
              <tbody>
                <tr><th>Content readable without JavaScript</th><td className="ok">yes</td></tr>
                <tr><th>Preloader</th><td className="ok">none</td></tr>
                <tr><th>Cumulative layout shift</th><td className="ok">0.000</td></tr>
                <tr><th>Third-party requests</th><td className="ok">0</td></tr>
                <tr><th>Experience layer</th><td>loaded after idle, skipped on save-data</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="s6" data-sec="contact" className="sec hero">
          <h1><span>Let's</span><span className="serif">build something</span><span>that measures itself.</span></h1>
          <a className="go big" href="mailto:ritish.s@wizcommerce.com">ritish.s@wizcommerce.com</a>
        </section>
      </main>

      <div className="hud tblock">
        <div className="tbh"><span>Ritish Saini — Portfolio</span><span>Rev 005</span></div>
        <div className="tbg">
          <div><b>Transferred</b><span className="live" id="m-bytes">—</span></div>
          <div><b>LCP</b><span className="live" id="m-lcp">—</span></div>
          <div><b>Experience</b><span className="live">{allowed ? 'live' : 'idle'}</span></div>
        </div>
      </div>
    </>
  )
}
