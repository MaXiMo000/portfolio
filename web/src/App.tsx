import { useEffect, useState, lazy, Suspense } from 'react'
import { initScroll } from './lib/scroll'
import ExperienceBoundary from './lib/ExperienceBoundary'
import { nudge } from './lib/nudge'
import { MODE, STILL } from './lib/mode'
import Resolving from './Resolving'
import { DeepDive, DiveTrigger } from './DeepDive'
import './fonts.css'
import './styles.css'

const Scene = lazy(() => import('./scene/Scene'))

/** The experience never gates the content: it is always loaded after idle,
 *  and 'off' means no canvas at all. */
function useExperienceAllowed() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    if (MODE === 'off') return
    const idle = (window as any).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 200))
    idle(() => setOk(true))
  }, [])
  return ok
}

const RAIL = ['Resolve', 'carabiner', 'firedrill', 'recur', 'LabLedger', 'QuizNest',
              'Recipe', 'Experience', 'Skills', 'Contact']

export default function App() {
  const allowed = useExperienceAllowed()
  const [ready, setReady] = useState(false)
  const [dive, setDive] = useState<string | null>(null)

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

      {allowed && !STILL && <Resolving done={ready} />}

      <header className="hud top">
        <span className="brand">
          <svg className="mark" viewBox="-50 -50 100 100" aria-hidden="true">
            <path d="M 33 0 L 40.6 14.8 L 31 11.3 L 33.1 27.8 L 25.3 21.2 L 21.6 37.4 L 16.5 28.6 L 7.5 42.6 L 5.7 32.5 L -7.5 42.6 L -5.7 32.5 L -21.6 37.4 L -16.5 28.6 L -33.1 27.8 L -25.3 21.2 L -40.6 14.8 L -31 11.3 L -43.2 0 L -33 0 L -40.6 -14.8 L -31 -11.3 L -33.1 -27.8 L -25.3 -21.2 L -21.6 -37.4 L -16.5 -28.6 L -7.5 -42.6 L -5.7 -32.5 L 7.5 -42.6 L 5.7 -32.5 L 21.6 -37.4 L 16.5 -28.6 L 33.1 -27.8 L 25.3 -21.2 L 40.6 -14.8 L 31 -11.3 L 43.2 0 Z" />
            <circle r="13" fill="var(--void)" />
            <circle r="5" fill="var(--beam)" />
          </svg>
          Ritish Saini
        </span>
        <span className="hud-right">
          <span className="role">Python · FastAPI · PostgreSQL · Elasticsearch · Celery</span>
          {/* The fast path section 09 already offers, reachable without
              scrolling past eight instruments first. Same four destinations,
              same order, so a visitor who lands here first isn't shown a
              different set of links than the one waiting for them at the end. */}
          <span className="links">
            <a href="https://github.com/MaXiMo000" aria-label="GitHub profile">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                  -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07
                  -1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
                  .64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                  .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                  0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/ritish-saini-2540a5253" aria-label="LinkedIn profile">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.58 5.6H.53V16h3.05V5.6ZM2.06.6C1 .6 .25 1.36.25 2.34c0 .96.73 1.73 1.78 1.73h.02
                  c1.08 0 1.79-.77 1.79-1.73C3.82 1.36 3.12.6 2.06.6ZM15.75 16h-.01v-5.6c0-2.75-1.47-4.03-3.43-4.03
                  -1.58 0-2.29.87-2.68 1.48V5.6H6.58c.04.86 0 10.4 0 10.4h3.05v-5.81c0-.31.02-.62.11-.84.24-.62.8-1.26
                  1.73-1.26 1.22 0 1.71.93 1.71 2.3V16h3.05Z" />
              </svg>
            </a>
            <a href="mailto:ritishsaini1995@gmail.com" aria-label="Email">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v.28l8 4.44 8-4.44V4.5A1.5 1.5 0 0 0 14.5 3h-13Z" />
                <path d="M16 6.16l-7.65 4.25a.75.75 0 0 1-.7 0L0 6.16V11.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V6.16Z" />
              </svg>
            </a>
            <a href="/ritish-saini-cv.pdf" download aria-label="Download CV (PDF)">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0a.75.75 0 0 1 .75.75v7.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 7.28a.75.75 0 0 1 1.06-1.06l2.47 2.47V.75A.75.75 0 0 1 8 0Z" />
                <path d="M1.5 10a.75.75 0 0 1 .75.75v2.5c0 .14.11.25.25.25h11c.14 0 .25-.11.25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.5 15h-11A1.75 1.75 0 0 1 .75 13.25v-2.5A.75.75 0 0 1 1.5 10Z" />
              </svg>
            </a>
          </span>
        </span>
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
            A repository. A Postgres backup. A bank export. A lab PDF. Six
            systems that take input nobody vetted — and <b>refuse to guess</b>{' '}
            about the parts they can't resolve.
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
              <dt>Cost</dt><dd><b>60</b> repos calibrated · <b>59</b> tests · SARIF · PyPI, GHCR, Marketplace</dd>
            </dl>
            <a
              className="go" href="https://github.com/MaXiMo000/carabiner"
              aria-label="Open the carabiner repository on GitHub"
              onPointerEnter={() => nudge(1)} onFocus={() => nudge(1)}
            >
              Open the repo →
            </a>
            <DiveTrigger project="carabiner" onOpen={setDive} />
          </div>
        </section>

        <section id="s2" data-sec="firedrill" className="sec">
          <div className="col">
            <p className="num">02 <em>/ the vessel</em></p>
            <h2>firedrill</h2>
            <p className="claim">A backup is not proven until <span className="serif">something restores it.</span></p>
            <dl>
              <dt>Problem</dt><dd>A <code>pg_dump</code> that exits 0 can still be a truncated file nobody has ever tried to read back.</dd>
              <dt>Hard</dt><dd>Matching the archive's own Postgres major and restoring inside a disposable container with no path to production, ever.</dd>
              <dt>Cost</dt><dd><b>6</b> Postgres majors, both directions on the corpus · field-tested against pagila, chinook and northwind — <span className="serif">and found a real gap</span> in a published sample database nobody had caught · PyPI, GHCR, GitHub Action</dd>
            </dl>
            <a
              className="go" href="https://maximo000.github.io/firedrill/"
              aria-label="Open the firedrill results page"
              onPointerEnter={() => nudge(2)} onFocus={() => nudge(2)}
            >
              See the proof →
            </a>
            <DiveTrigger project="firedrill" onOpen={setDive} />
          </div>
        </section>

        <section id="s3" data-sec="recur" className="sec">
          <div className="col">
            <p className="num">03 <em>/ the rotor</em></p>
            <h2>recur</h2>
            <p className="claim">Which charges <span className="serif">actually</span> recur.</p>
            <dl>
              <dt>Problem</dt><dd>A bank export is a wall of rows. The subscriptions are in there somewhere.</dd>
              <dt>Hard</dt><dd>Postgres row-level security, so a query that forgets its tenant filter returns zero rows instead of someone else's money.</dd>
              <dt>Cost</dt><dd>FastAPI · SQLAlchemy · argon2id · OAuth 2.1 + PKCE · remote MCP server · <b>0</b> bank credentials stored, ever</dd>
            </dl>
            <a
              className="go" href="https://github.com/MaXiMo000/recur"
              aria-label="Open the recur repository on GitHub"
              onPointerEnter={() => nudge(2)} onFocus={() => nudge(2)}
            >
              Open the repo →
            </a>
            <DiveTrigger project="recur" onOpen={setDive} />
          </div>
        </section>

        <section id="s4" data-sec="labledger" className="sec">
          <div className="col">
            <p className="num">04 <em>/ the spectrometer</em></p>
            <h2>LabLedger</h2>
            <p className="claim">A lab PDF, resolved to <span className="serif">codes.</span></p>
            <dl>
              <dt>Problem</dt><dd>Every lab formats results differently. The numbers stop meaning anything.</dd>
              <dt>Hard</dt><dd>Resolving each test to a LOINC code, converting units, and picking the right reference interval.</dd>
              <dt>Cost</dt><dd>Multi-page PDFs · trend charts · <span className="esc">anything uncertain goes to a human</span></dd>
            </dl>
            <a
              className="go" href="https://labledger-web.onrender.com/"
              aria-label="See LabLedger running live"
              onPointerEnter={() => nudge(4)} onFocus={() => nudge(4)}
            >
              See it live →
            </a>
            <DiveTrigger project="labledger" onOpen={setDive} />
          </div>
        </section>

        <section id="s5" data-sec="quiznest" className="sec">
          <div className="col">
            <p className="num">05 <em>/ the tumbler</em></p>
            <h2>QuizNest</h2>
            <p className="claim">Knowledge either <span className="serif">aligns,</span> or it doesn't.</p>
            <dl>
              <dt>Problem</dt><dd>Reading something is not knowing it, and a score out of ten doesn't tell you which part you missed.</dd>
              <dt>Hard</dt><dd>Generating questions that actually discriminate, then turning a stream of answers into analytics a learner can act on.</dd>
              <dt>Cost</dt><dd>MERN · AI-generated question sets · per-topic analytics · gamification</dd>
            </dl>
            <a
              className="go" href="https://quiz-app-cp2h.onrender.com/"
              aria-label="See QuizNest running live"
              onPointerEnter={() => nudge(5)} onFocus={() => nudge(5)}
            >
              See it live →
            </a>
            <DiveTrigger project="quiznest" onOpen={setDive} />
          </div>
        </section>

        <section id="s6" data-sec="recipe" className="sec">
          <div className="col">
            <p className="num">06 <em>/ the manifold</em></p>
            <h2>AI-Recipe-Maker</h2>
            <p className="claim">Five measured inputs, <span className="serif">one plan.</span></p>
            <dl>
              <dt>Problem</dt><dd>"What can I cook with this?" is easy to answer badly and hard to answer with real nutrition behind it.</dd>
              <dt>Hard</dt><dd>Dosing the constraints — what's in the fridge, what it costs nutritionally, what a week of it looks like — into one coherent plan.</dd>
              <dt>Cost</dt><dd>TypeScript · Claude-powered generation · nutrition analysis · meal plans</dd>
            </dl>
            <a
              className="go" href="https://github.com/MaXiMo000/AI-Recipe-Maker"
              aria-label="Open the AI-Recipe-Maker repository on GitHub"
              onPointerEnter={() => nudge(6)} onFocus={() => nudge(6)}
            >
              Open the repo →
            </a>
            <DiveTrigger project="recipe" onOpen={setDive} />
          </div>
        </section>

        {/* 07 — the core sample. One band per line below, which is not a
            coincidence: the instrument reads this list. */}
        <section id="s7" data-sec="experience" className="sec">
          <div className="col">
            <p className="num">07 <em>/ the core sample</em></p>
            <h2>Wizcommerce</h2>
            <p className="claim">Backend in production, on a <span className="serif">multi-tenant</span> platform.</p>
            <p className="post">
              <span className="post__role">Backend Developer</span>
              <span className="post__where">Gurgaon &middot; Apr 2025 &mdash; Sep 2026</span>
            </p>
            {/* Written as the things that were actually built and handed over,
                not as ownership of the platform they went into. Six lines,
                because the core reads six bands. */}
            <ul className="strata">
              <li>Search features on Elasticsearch &mdash; the indexes, the queries and the
                  endpoints over them. Query latency down <b>~40%</b></li>
              <li>A server-side row model over SQL, so grids too large to load at once
                  page, sort and filter the way the Elasticsearch path already did</li>
              <li>A payment gateway integration, taken end to end</li>
              <li>Address validation before send, through Mailgun &mdash; a bad address
                  fails on our side instead of against the sending domain</li>
              {/* The space before the number is explicit: JSX trims the end of a
                  text line, so a dash at a line break runs straight into it. */}
              <li>Query and index work across PostgreSQL and SQLAlchemy &mdash;{' '}
                  <b>25%</b> less database load</li>
              <li><b>30+</b> REST APIs on FastAPI, a good number of them small projects
                  in their own right &mdash; <b>30%</b> off data retrieval</li>
            </ul>
          </div>
        </section>

        {/* 08 — the feeler gauge. Seven groups, seven leaves. */}
        <section id="s8" data-sec="skills" className="sec">
          <div className="col">
            <p className="num">08 <em>/ the feeler gauge</em></p>
            <h2>What I reach for</h2>
            <p className="claim">Seven leaves, each ground to <span className="serif">one thickness.</span></p>
            <dl className="gauge">
              <dt>Language</dt><dd>Python &middot; SQL &middot; Java</dd>
              <dt>Backend</dt><dd>FastAPI &middot; REST &middot; JWT auth</dd>
              <dt>Data</dt><dd>PostgreSQL &middot; MongoDB &middot; SQLAlchemy</dd>
              <dt>Search</dt><dd>Elasticsearch &middot; Redis</dd>
              <dt>Async</dt><dd>Celery &middot; background jobs</dd>
              <dt>Ship</dt><dd>Docker &middot; Git &middot; CI/CD &middot; Sentry</dd>
              <dt>Judgement</dt><dd>System design &middot; API design &middot; performance tuning &middot; debugging</dd>
            </dl>
            <p className="footnote">
              B.Tech Computer Science, Chitkara University &mdash; CGPA <b>9.02</b>.
              Certificates in deep learning, data science and product management.
            </p>
          </div>
        </section>

        {/* Not a rail-numbered instrument section on purpose: the six above
            each earned a bespoke 3D transition because each is a genuinely
            different mechanism worth dwelling on. These twelve are real,
            live, and tested (see each repo's own README/CI) but a flat list
            is the honest way to surface them, not a claim that the rail
            above is the whole portfolio. */}
        <div className="more">
          <div className="col">
            <p className="num">&mdash; <em>/ the rest of the shop</em></p>
            <h2>More, on GitHub</h2>
            <p className="claim">
              Six above get the full 3D treatment because each is a
              <span className="serif"> different mechanism.</span> These are
              real too &mdash; tested, documented, most with their own CI &mdash;
              just not each worth inventing a new instrument for.
            </p>
            <ul className="strata more__list">
              <li><a href="https://github.com/MaXiMo000/receipt" aria-label="Open the receipt repository on GitHub">receipt</a> &mdash; a receipt for what a shell command actually touched, not just what it was asked to do</li>
              <li><a href="https://github.com/MaXiMo000/invariant" aria-label="Open the invariant repository on GitHub">invariant</a> &mdash; asserts a system property is still true, across six check types</li>
              <li><a href="https://github.com/MaXiMo000/satchel" aria-label="Open the satchel repository on GitHub">satchel</a> &mdash; a local-first reading queue with one-click, SSRF-hardened capture</li>
              <li><a href="https://github.com/MaXiMo000/witness" aria-label="Open the witness repository on GitHub">witness</a> &mdash; a browser extension that checks a site's real traffic against what it claims</li>
              <li><a href="https://github.com/MaXiMo000/custody" aria-label="Open the custody repository on GitHub">custody</a> &mdash; a live Claude Code hook, a receipt for every file edit or shell call an agent makes</li>
              <li><a href="https://github.com/MaXiMo000/providence" aria-label="Open the providence repository on GitHub">providence</a> &mdash; the shared evidence-bundle shape receipt and invariant each arrived at independently</li>
              <li><a href="https://github.com/MaXiMo000/sourced" aria-label="Open the sourced repository on GitHub">sourced</a> &mdash; splits LLM output into per-claim sentences, checks each against its own source</li>
              <li><a href="https://github.com/MaXiMo000/escrow" aria-label="Open the escrow repository on GitHub">escrow</a> &mdash; a dead man's switch for cron and scheduled jobs</li>
              <li><a href="https://github.com/MaXiMo000/lockstep" aria-label="Open the lockstep repository on GitHub">lockstep</a> &mdash; what's actually installed right now, checked against what's pinned</li>
              <li><a href="https://github.com/MaXiMo000/portable" aria-label="Open the portable repository on GitHub">portable</a> &mdash; does your own data export actually contain what it promised</li>
              <li><a href="https://github.com/MaXiMo000/clicked" aria-label="Open the clicked repository on GitHub">clicked</a> &mdash; proof of what one browser click actually did, network traffic included</li>
              <li><a href="https://github.com/MaXiMo000/drift" aria-label="Open the drift repository on GitHub">drift</a> &mdash; does a device's real traffic match the domains it's declared to contact</li>
            </ul>
            <p className="footnote">
              <a href="https://github.com/MaXiMo000?tab=repositories" aria-label="See every public repository on GitHub">Every public repo &rarr;</a>
            </p>
          </div>
        </div>

        <section id="s9" data-sec="contact" className="sec hero">
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

      <DeepDive project={dive} onClose={() => setDive(null)} />
    </>
  )
}
