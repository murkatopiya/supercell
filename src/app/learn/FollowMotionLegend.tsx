import { TRACER_COLORS } from "../../rendering/tracerObserveSlot.js";

/** Presentation only: symbols explain the existing scene without owning resources. */
export function FollowMotionLegend() {
  const [a, b] = TRACER_COLORS.map(color => `#${color.toString(16).padStart(6, "0")}`);
  return <section className="learn__motion-legend" aria-label="Follow Motion scene guide">
    <h3>Reading the scene</h3>
    <dl>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><circle cx="7" cy="6" r="4" fill={a} /><text x="16" y="10" fill="currentColor">A</text><circle cx="7" cy="18" r="4" fill={b} /><text x="16" y="23" fill="currentColor">B</text></svg>Tracer markers A/B</dt>
        <dd>Solid markers show the tracer positions.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M3 8H37" stroke={a} strokeWidth="2" /><path d="M3 17H37" stroke={b} strokeWidth="2" /></svg>Recorded path</dt>
        <dd>Where each tracer has already travelled, not a predicted route.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><ellipse cx="11" cy="12" rx="8" ry="4" fill="none" stroke={a} strokeWidth="2" /><ellipse cx="29" cy="12" rx="8" ry="4" fill="none" stroke={b} strokeWidth="2" /></svg>Starting ring</dt>
        <dd>The tracer’s initial position.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M20 2V20" stroke="#b9c7d6" strokeDasharray="3 2" /><ellipse cx="20" cy="21" rx="5" ry="2" fill="none" stroke="#b9c7d6" /></svg>Height guide</dt>
        <dd>Marks the initial height; the small ring is its projection on model ground, not a trajectory.</dd></div>
    </dl>
  </section>;
}
