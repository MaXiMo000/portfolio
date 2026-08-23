import { useEffect, useState, lazy, Suspense } from 'react'
import { initScroll } from './lib/scroll'
import ExperienceBoundary from './lib/ExperienceBoundary'
import { nudge } from './lib/nudge'
import Resolving from './Resolving'
import './fonts.css'
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

const RAIL = ['Resolve', 'carabiner', 'recur', 'LabLedger', 'QuizNest', 'Recipe', 'Contact']

export default function App() {
  const allowed = useExperienceAllowed()
  const [ready, setReady] = useState(false)

  // The drawing must never outlive its purpose. If the scene errors out or the
  // context is lost, onReady never fires — so retire it on a timer regardless.
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 9000)
    return () => clearTimeout(id)
  }, [])
  useEffect(() => initScroll(), [])

  return (
    <>
      <a className="skip" href="#s1">Skip to the work</a>

      {allowed && (
        <ExperienceBoundary>
          <Suspense fallback={null}>
            <Scene onReady={() => setReady(true)} />
          </Suspense>
        </ExperienceBoundary>
      )}

      {allowed && <Resolving done={ready} />}

      <header className="hud top">
        <span className="brand">
          <svg className="mark" viewBox="-50 -50 100 100" aria-hidden="true">
            <path d="M 33 0 L 40.6 14.8 L 31 11.3 L 33.1 27.8 L 25.3 21.2 L 21.6 37.4 L 16.5 28.6 L 7.5 42.6 L 5.7 32.5 L -7.5 42.6 L -5.7 32.5 L -21.6 37.4 L -16.5 28.6 L -33.1 27.8 L -25.3 21.2 L -40.6 14.8 L -31 11.3 L -43.2 0 L -33 0 L -40.6 -14.8 L -31 -11.3 L -33.1 -27.8 L -25.3 -21.2 L -21.6 -37.4 L -16.5 -28.6 L -7.5 -42.6 L -5.7 -32.5 L 7.5 -42.6 L 5.7 -32.5 L 21.6 -37.4 L 16.5 -28.6 L 33.1 -27.8 L 25.3 -21.2 L 40.6 -14.8 L 31 -11.3 L 43.2 0 Z" />
            <circle r="13" fill="var(--void)" />
            <circle r="5" fill="var(--beam)" />
          </svg>
          Ritish Saini
        </span>
        <span className="role">Python · FastAPI · PostgreSQL · Elasticsearch · Celery</span>
      </header>

      <nav className="hud rail" aria-label="Sections">
        {RAIL.map((n, i) => (
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
            A repository. A bank export. A lab PDF. Five systems that take input
            nobody vetted — and <b>refuse to guess</b> about the parts they
            can't resolve.
          </p>
        </section>

        <section id="s1" data-sec="carabiner" className="sec">
          <div className="col">
            <p className="num">01 <em>/ the ratchet</em></p>
            <h2>carabiner</h2>
            <p className="claim">A security baseline that <span className="serif">only tightens.</span></p>
            <dl>
              <dt>Problem</dt><dd>Repository posture rots silently between audits.</dd>
              <dt>Hard</dt><dd>A ratchet that never loosens — not by accident, not by a well-meaning PR.</dd>
              <dt>Cost</dt><dd><b>60</b> repos calibrated · <b>57</b> tests · SARIF · PyPI, GHCR, Marketplace</dd>
            </dl>
            <a
              className="go" href="https://github.com/MaXiMo000/carabiner"
              onPointerEnter={() => nudge(1)} onFocus={() => nudge(1)}
            >
              Open the repo →
            </a>
          </div>
        </section>

        <section id="s2" data-sec="recur" className="sec">
          <div className="col">
            <p className="num">02 <em>/ the rotor</em></p>
            <h2>recur</h2>
            <p className="claim">Which charges <span className="serif">actually</span> recur.</p>
            <dl>
              <dt>Problem</dt><dd>A bank export is a wall of rows. The subscriptions are in there somewhere.</dd>
              <dt>Hard</dt><dd>Postgres row-level security, so a query that forgets its tenant filter returns zero rows instead of someone else's money.</dd>
              <dt>Cost</dt><dd>FastAPI · SQLAlchemy · argon2id · OAuth 2.1 + PKCE · remote MCP server · <b>0</b> bank credentials stored, ever</dd>
            </dl>
          </div>
        </section>

        <section id="s3" data-sec="labledger" className="sec">
          <div className="col">
            <p className="num">03 <em>/ the spectrometer</em></p>
            <h2>LabLedger</h2>
            <p className="claim">A lab PDF, resolved to <span className="serif">codes.</span></p>
            <dl>
              <dt>Problem</dt><dd>Every lab formats results differently. The numbers stop meaning anything.</dd>
              <dt>Hard</dt><dd>Resolving each test to a LOINC code, converting units, and picking the right reference interval.</dd>
              <dt>Cost</dt><dd>Multi-page PDFs · trend charts · <span className="esc">anything uncertain goes to a human</span></dd>
            </dl>
            <a className="go" href="https://labledger-web.onrender.com/">See it live →</a>
          </div>
        </section>

        <section id="s4" data-sec="quiznest" className="sec">
          <div className="col">
            <p className="num">04 <em>/ the tumbler</em></p>
            <h2>QuizNest</h2>
            <p className="claim">Knowledge either <span className="serif">aligns,</span> or it doesn't.</p>
            <dl>
              <dt>Problem</dt><dd>Reading something is not knowing it, and a score out of ten doesn't tell you which part you missed.</dd>
              <dt>Hard</dt><dd>Generating questions that actually discriminate, then turning a stream of answers into analytics a learner can act on.</dd>
              <dt>Cost</dt><dd>MERN · AI-generated question sets · per-topic analytics · gamification</dd>
            </dl>
            <a className="go" href="https://quiz-app-cp2h.onrender.com/">See it live →</a>
          </div>
        </section>

        <section id="s5" data-sec="recipe" className="sec">
          <div className="col">
            <p className="num">05 <em>/ the manifold</em></p>
            <h2>AI-Recipe-Maker</h2>
            <p className="claim">Five measured inputs, <span className="serif">one plan.</span></p>
            <dl>
              <dt>Problem</dt><dd>"What can I cook with this?" is easy to answer badly and hard to answer with real nutrition behind it.</dd>
              <dt>Hard</dt><dd>Dosing the constraints — what's in the fridge, what it costs nutritionally, what a week of it looks like — into one coherent plan.</dd>
              <dt>Cost</dt><dd>TypeScript · Claude-powered generation · nutrition analysis · meal plans</dd>
            </dl>
          </div>
        </section>

        <section id="s6" data-sec="contact" className="sec hero">
          <h1 className="close">
            <span>Let's build</span>
            <span className="serif">something</span>
            <span>that holds up.</span>
          </h1>
          <a className="go big" href="mailto:ritishsaini1995@gmail.com">ritishsaini1995@gmail.com</a>
          <p className="ends">
            <a href="/ritish-saini-cv.pdf" download>CV (PDF)</a>
            <a href="https://github.com/MaXiMo000">GitHub</a>
            <a href="https://www.linkedin.com/in/ritish-saini-2540a5253">LinkedIn</a>
          </p>
        </section>
      </main>
    </>
  )
}
