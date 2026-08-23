/**
 * Not a preloader. The content is already painted, readable and scrollable —
 * this only occupies the region the instrument will appear in, so that region
 * is a drawing of the part rather than a black hole while the scene chunk
 * downloads. It gates nothing and it never reports fake progress.
 *
 * The conceit: a technical drawing of the housing draws itself, then the real
 * render arrives and replaces it. The document resolves into the object.
 */
export default function Resolving({ done }: { done: boolean }) {
  return (
    <div className={`resolving${done ? ' done' : ''}`} aria-hidden="true">
      <svg viewBox="-120 -150 240 300" fill="none">
        <g stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {/* the lathed profile, drawn as an engineering elevation */}
          <ellipse className="d d1" cx="0" cy="-92" rx="72" ry="20" />
          <path className="d d2" d="M -72 -92 L -72 92" />
          <path className="d d3" d="M 72 -92 L 72 92" />
          <ellipse className="d d4" cx="0" cy="92" rx="72" ry="20" />
          {/* the two chamfer rings */}
          <ellipse className="d d5" cx="0" cy="-40" rx="72" ry="19" opacity=".55" />
          <ellipse className="d d6" cx="0" cy="40" rx="72" ry="19" opacity=".55" />
          {/* centre line and dimension ticks */}
          <path className="d d7" d="M 0 -140 L 0 140" strokeDasharray="6 5" opacity=".3" />
          <path className="d d8" d="M -104 0 L -84 0 M 84 0 L 104 0" opacity=".45" />
        </g>
      </svg>
      <span className="rl-label">Resolving</span>
    </div>
  )
}
