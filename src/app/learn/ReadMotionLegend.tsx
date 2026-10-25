import { TRACER_COLORS } from "../../rendering/tracerObserveSlot.js";

/** No saved-reference object is drawn in the scene; it is a measurement card. */
export function ReadMotionLegend() {
  const a = `#${TRACER_COLORS[0].toString(16).padStart(6, "0")}`;
  return <section className="learn__motion-legend" aria-label="Read the Motion scene guide">
    <h3>Reading the scene</h3>
    <dl>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M2 18L13 13L23 9" fill="none" stroke={a} strokeWidth="2" /><circle cx="24" cy="9" r="4" fill={a} /><text x="30" y="14" fill="currentColor">A</text></svg>Tracer marker and recorded path</dt>
        <dd>A shows the displayed tracer position; the line shows where it travelled.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M3 12H29" stroke="#ffdc75" strokeWidth="3" /><path d="M27 7L37 12L27 17Z" fill="#ffdc75" /></svg>Local velocity arrow</dt>
        <dd>Airflow direction and speed at A, not a path or predicted displacement.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="13" ry="5" fill="none" stroke={a} strokeWidth="2" /></svg>Starting ring</dt>
        <dd>A’s initial position.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M20 2V20" stroke="#b9c7d6" strokeDasharray="3 2" /><ellipse cx="20" cy="21" rx="5" ry="2" fill="none" stroke="#b9c7d6" /></svg>Height guide</dt>
        <dd>The initial height above model ground, not a trajectory.</dd></div>
    </dl>
  </section>;
}
