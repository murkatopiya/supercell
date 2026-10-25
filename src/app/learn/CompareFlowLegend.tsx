import { TRACER_COLORS } from "../../rendering/tracerObserveSlot.js";

/** Symbols mirror the scene: labels/shapes also identify each item without colour. */
export function CompareFlowLegend() {
  return <section className="compare-flow__legend" aria-label="Reading the scene">
    <h3>Reading the scene</h3>
    <dl>
      {(["A", "B"] as const).map((label, index) => <div key={label}>
        <dt><svg aria-hidden="true" viewBox="0 0 40 24"><circle cx="12" cy="12" r="5" fill={`#${TRACER_COLORS[index]!.toString(16).padStart(6, "0")}`} /><text x="23" y="17" fill="currentColor">{label}</text></svg>Probe {label}</dt>
        <dd>{label === "A" ? "Fixed reference point." : "Stationary measurement point you can reposition; it does not travel with the air."}</dd>
      </div>)}
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M3 12H29" stroke="#ffdc75" strokeWidth="3" /><path d="M27 7L37 12L27 17Z" fill="#ffdc75" /></svg>Velocity arrow</dt>
        <dd>Local airflow direction and speed, not the probe’s path.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M20 2V20" stroke="#b9c7d6" strokeDasharray="3 2" /><ellipse cx="20" cy="21" rx="8" ry="2" fill="none" stroke="#b9c7d6" /></svg>Height guide</dt>
        <dd>Vertical reference to model ground, not a trajectory.</dd></div>
      <div><dt><svg aria-hidden="true" viewBox="0 0 40 24"><path d="M3 19L12 5H37L28 19Z" fill="#9bc9df" fillOpacity=".1" stroke="#b8e5f5" strokeOpacity=".9" /></svg>Placement area</dt>
        <dd>Where B can be placed, not the model boundary. Appears in the scene only when Move B is on.</dd></div>
    </dl>
  </section>;
}
