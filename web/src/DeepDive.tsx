import { Fragment, useEffect, useRef } from 'react'

/**
 * "Look inside" — one real excerpt and a small schematic per project, because
 * the pitch alone asks to be taken on faith. Every excerpt below is verbatim
 * from the actual repository, not written for this panel; the schematic is
 * the one new drawing, built from the same primitive every time (a labelled
 * box, a line, the last box in --beam) so nine different systems still read
 * as one visual grammar rather than six one-off diagrams.
 */

type Project = {
  lang: string
  file: string
  code: string
  caption: string
  boxes: string[]
}

export const DEEP_DIVE: Record<string, Project> = {
  carabiner: {
    lang: 'python', file: 'carabiner/finding.py',
    code: `@property
def fingerprint(self) -> str:
    """Stable across reformatting, line shifts and whitespace changes.
    ...
    """
    norm = re.sub(r"\\s+", " ", self.snippet).strip().lower()
    raw = "|".join((self.engine, self.rule, self.path, norm))
    return hashlib.sha256(raw.encode()).hexdigest()[:16]`,
    caption: 'Every engine reports into this one hash. Line number is excluded on purpose — an added import must not resurrect an accepted finding.',
    boxes: ['6 engines', 'Finding', 'baseline.json', 'exit code'],
  },
  firedrill: {
    lang: 'python', file: 'firedrill/drill.py',
    code: `@property
def ok(self) -> bool:
    """Green requires both: it ran, and it found nothing that matters."""
    return self.verified and not should_fail(self.findings, self.fail_on)`,
    caption: 'A restore that never ran must not report green just because nothing failed — nothing failing is not the same fact as something succeeding.',
    boxes: ['archive', 'disposable container', 'the ladder', 'verified'],
  },
  recur: {
    lang: 'sql', file: 'app/schema.sql',
    code: `CREATE OR REPLACE FUNCTION recur_current_user_id() RETURNS BIGINT
LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('recur.user_id', true), '')::BIGINT
$fn$;`,
    caption: 'Every policy checks this function, not a WHERE clause a handler could forget. An unset session returns NULL, and NULL matches nothing — closed by default.',
    boxes: ['connection', 'RLS policy', "this user's rows"],
  },
  labledger: {
    lang: 'python', file: 'app/pipeline/flags.py',
    code: `def critical_for(loinc: str, value: float | None, unit: str | None) -> Critical | None:
    """Report whether a canonical value sits at or beyond a critical limit.

    Returns None both for "within limits" and for "no limit is published for
    this analyte". Those are genuinely different, and the caller distinguishes
    them with \`is_assessed\` -- collapsing them here would let an unassessed
    analyte render as though it had been checked and passed.
    """
    entry = CRITICAL.get(loinc)
    if entry is None or value is None or unit is None:
        return None
    # ...`,
    caption: 'Two different reasons return the same None on purpose. Collapsing them here would let "not checked" render as "checked and fine."',
    boxes: ['PDF', 'extract', 'map to LOINC', 'flag'],
  },
  quiznest: {
    lang: 'javascript', file: 'backend/services/aiQuestionGenerator.js',
    code: `export const DIFFICULTY_CONFIG = {
    easy: {
        bloomLevels: ["remember", "understand"],
        timeMultiplier: 1.0,
        distractorComplexity: "simple",
    },
    medium: {
        bloomLevels: ["understand", "apply", "analyze"],
        timeMultiplier: 1.4,
        distractorComplexity: "moderate",
    },
    hard: {
        bloomLevels: ["analyze", "evaluate", "synthesize"],
        timeMultiplier: 1.8,
        distractorComplexity: "nuanced",
    },
};`,
    caption: 'Difficulty isn’t a random-number knob. Each tier names which cognitive level (Bloom’s taxonomy) a question actually has to reach.',
    boxes: ['topic', 'Bloom-leveled prompt', 'question set', 'score'],
  },
  recipe: {
    lang: 'typescript', file: 'recipeAIService.ts',
    code: `async generateMealPlan(
  days: number,
  preferences: UserPreferences,
  goals: MealPlanGoals
): Promise<any> {
  try {
    const prompt = buildMealPlanPrompt(days, preferences, goals);
    const text = await this.getAiText(prompt, 8192);
    return this.parseMealPlanResponse(text);
  } catch (error) {
    logger.error('Failed to generate meal plan:', error);
    throw error;
  }
}`,
    caption: 'Three separate inputs — a duration, a diet, a goal — become one prompt, never three calls a client has to reconcile itself.',
    boxes: ['days + preferences + goals', 'one prompt', 'parsed plan'],
  },
  snazzlebop: {
    lang: 'python', file: 'backend/tests/test_dice.py',
    code: `def test_dice_are_secret(self):
    g = make(3)
    for viewer in ("p0", "p1", *SPECTATORS):
        view = g.view_for(viewer)
        self.assertNotIn("last", view)
        self.assertEqual(view["you"]["dice"], g.dice.get(viewer, []))
    self.assertEqual(g.view_for("tv:x")["you"]["dice"], [])
    self.assertEqual(g.view_for("p1")["counts"], {"p0": 5, "p1": 5, "p2": 5})`,
    caption: 'Liar’s Dice. Every player, every spectator and the TV is asked what it can see: your own dice, and only how many everyone else holds. Every game has a test like this one.',
    boxes: ['a phone sends an intent', 'the game, on the server', 'view_for(player)', 'only what they may see'],
  },
  aninest: {
    lang: 'javascript', file: 'backend/src/lib/animeSource.js',
    code: `async function withFallback(key, ttl, primaryName, primary, fallbackName, fallback, persistMs) {
  const compute = async () => {
    try {
      return await primary();
    } catch (err) {
      logger.warn({ err, key, primaryName, fallbackName }, \`\${primaryName} failed, falling back to \${fallbackName}\`);
      return fallback();
    }
  };
  return cached(key, ttl, persistMs ? () => persistentCached(\`anime:\${key}\`, persistMs, compute) : compute);
}`,
    caption: 'Every list on the site goes through this: AniList, then Jikan when AniList fails, and under both the last good copy kept in its own database.',
    boxes: ['AniList', 'Jikan', 'stored copy', 'the page'],
  },
  afterglow: {
    lang: 'python', file: 'backend/worker/git.py',
    code: `def clone(self, url: str, dest: str, *extra: str) -> Path:
    """Bare clone with no working tree, watched for time and size."""
    self._remaining()
    target = self.scratch / dest
    self._watch(
        self._spawn(
            ["clone", "--bare", "--quiet", "--no-tags", "--single-branch", "--no-recurse-submodules",
             *extra, "--", url, str(target)]
        )
    )  # fmt: skip
    return target`,
    caption: 'A stranger’s repository is read without ever checking a file out: a bare clone (blobless for the history pass), under a time and size budget, from a sandbox that can only reach github.com.',
    boxes: ['public repo', 'bare, blobless clone', 'git log metadata', 'the city'],
  },
}

function Schematic({ boxes }: { boxes: string[] }) {
  return (
    <div className="schematic" aria-hidden="true">
      {boxes.map((label, i) => (
        <Fragment key={label}>
          <span className="schematic__box">{label}</span>
          {i < boxes.length - 1 && <span className="schematic__arrow" />}
        </Fragment>
      ))}
    </div>
  )
}

// Matches each project's own casing in its <h2> exactly -- carabiner,
// firedrill and recur are lowercase brand names on this site, not Title
// Case defaulted from the project key.
const DISPLAY_NAME: Record<string, string> = {
  labledger: 'LabLedger', quiznest: 'QuizNest', recipe: 'AI-Recipe-Maker',
}
const nameOf = (project: string) => DISPLAY_NAME[project] ?? project

export function DiveTrigger({ project, onOpen }: { project: string; onOpen: (p: string) => void }) {
  return (
    <button type="button" className="dive-trigger" onClick={() => onOpen(project)}
            aria-label={`Look inside ${nameOf(project)}'s code`}>
      Look inside →
    </button>
  )
}

export function DeepDive({ project, onClose }: { project: string | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusTo = useRef<Element | null>(null)

  useEffect(() => {
    if (!project) return
    returnFocusTo.current = document.activeElement
    closeRef.current?.focus()

    const main = document.querySelector('main')
    // `inert` (native, no library) removes the rest of the page from both the
    // accessibility tree and the tab order while the dialog is open, rather
    // than a hand-rolled focus trap re-implementing what the platform gives.
    main?.setAttribute('inert', '')
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      main?.removeAttribute('inert')
      document.body.style.overflow = ''
      ;(returnFocusTo.current as HTMLElement | null)?.focus?.()
    }
  }, [project, onClose])

  if (!project) return null
  const p = DEEP_DIVE[project]
  if (!p) return null
  const name = nameOf(project)

  return (
    <div className="dive-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="dive" role="dialog" aria-modal="true" aria-labelledby="dive-title" ref={panelRef}>
        <button type="button" className="dive__close" onClick={onClose} ref={closeRef}
                aria-label={`Close ${name}'s code`}>
          Close <span aria-hidden="true">✕</span>
        </button>
        <p className="eyebrow">Real code, not the pitch</p>
        <h3 id="dive-title" className="dive__title">{name}</h3>
        <Schematic boxes={p.boxes} />
        <p className="dive__file">{p.file}</p>
        <pre className="dive__code"><code>{p.code}</code></pre>
        <p className="dive__caption">{p.caption}</p>
      </div>
    </div>
  )
}
