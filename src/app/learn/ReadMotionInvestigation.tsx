import type { MeasuredMotion, RecordedMotion } from "./ReadMotionInspection.js";
import type { ReactNode } from "react";

function VelocityValue({ value }: { value: number }) {
  return <span className="read-motion__number">{value.toFixed(2)}<small> m/s</small></span>;
}

function MotionValues({ motion }: { motion: RecordedMotion }) {
  return <dl className="read-motion__values">
    <div className="read-motion__primary"><dt>Speed</dt><dd>{motion.kind === "available" ? <VelocityValue value={motion.speed} /> : "Unavailable"}</dd></div>
    <div className="read-motion__primary"><dt>Vertical velocity</dt><dd>{motion.kind === "available" ? <VelocityValue value={motion.vertical} /> : "Unavailable"}</dd></div>
    <div><dt>Height</dt><dd>{motion.height === null ? "Unavailable" : `${motion.height.toFixed(0)} m`}</dd></div>
    <div><dt>Model time</dt><dd>{motion.modelTime === null ? "Unavailable" : `${motion.modelTime.toFixed(1)} s`}</dd></div>
  </dl>;
}

export function ReadMotionInvestigation({ current, reference, sampleCount, inspecting, onSelect, onSave, onClear, lessonActions }: {
  current: RecordedMotion;
  reference: MeasuredMotion | null;
  sampleCount: number;
  inspecting: boolean;
  onSelect: (index: number) => void;
  onSave: () => void;
  onClear: () => void;
  lessonActions?: ReactNode;
}) {
  return <div className="read-motion__investigation">
    <section className="ui-panel read-motion__timeline-panel" aria-labelledby="read-motion-investigate-title">
    <p className="learn__phase" role="status">Investigate the path · Phase 2 of 2</p>
    <h2 id="read-motion-investigate-title">Now investigate the path</h2>
    <p>The marker encountered different velocities along its path.</p>
    <p>The flight is complete. Choose a recorded moment to inspect how the airflow was moving at that position.</p>
    {sampleCount > 0 ? <div className="read-motion__timeline">
      <label htmlFor="read-motion-timeline">Recorded model time</label>
      <output htmlFor="read-motion-timeline" aria-label="Selected model time">{current.modelTime === null ? "Unavailable" : `${current.modelTime.toFixed(1)} s`}</output>
      <input id="read-motion-timeline" type="range" min={0} max={sampleCount - 1} step={1}
        value={current.historyIndex ?? sampleCount - 1}
        aria-valuetext={current.modelTime === null ? "Unavailable" : `${current.modelTime.toFixed(1)} seconds`}
        onChange={event => onSelect(Number(event.currentTarget.value))} />
      <div className="read-motion__timeline-ends"><span>0 s</span><span>120 s</span></div>
      <p className="learn__model-note">Each step selects a recorded state, 0.1 model seconds apart.</p>
    </div> : <p role="status">Recorded history unavailable. Replay to start a new observation.</p>}
    {inspecting && <p className="read-motion__inspection-status" role="status">Inspecting recorded motion</p>}
    </section>
    <section className="ui-panel read-motion__inspector" aria-label="Velocity inspector">
    {current.kind === "unavailable" && <p role="status">Velocity inspection unavailable for this recorded moment. No velocity arrow is shown.</p>}
    <p className="learn__model-note">Storm-relative velocity · Height above model ground</p>
    <div className="read-motion__comparison">
      {reference && <section aria-label="Saved reference moment"><h3>Saved reference</h3><MotionValues motion={reference} /></section>}
      <section aria-label="Selected recorded moment"><h3>Selected moment</h3><MotionValues motion={current} /></section>
    </div>
    <details className="learn__details read-motion__components"><summary>Show components</summary>
      <dl className="read-motion__values">
        <div><dt>Eastward</dt><dd>{current.kind === "available" ? `${current.eastward.toFixed(2)} m/s` : "Unavailable"}</dd></div>
        <div><dt>Northward</dt><dd>{current.kind === "available" ? `${current.northward.toFixed(2)} m/s` : "Unavailable"}</dd></div>
      </dl>
      <p>Eastward and Northward can be negative: negative means westward or southward. Vertical velocity is positive upward and negative downward.</p>
      <p>These are coordinate components of the total velocity, not contributions from separate airflow fields.</p>
    </details>
    {!reference && <p className="learn__model-note">Save the selected moment to keep its measurements as a reference while you inspect another moment.</p>}
    <div className="learn__controls">
      <button type="button" className="ui-button" disabled={current.kind !== "available"} onClick={onSave}>Save for comparison</button>
      {reference && <button type="button" className="ui-button" onClick={onClear}>Clear saved reference</button>}
    </div>
    {reference && <p className="learn__model-note">Saving another moment replaces the saved reference.</p>}
    {inspecting && <section className="read-motion__conclusion" aria-label="What the comparison shows">
      <h3>Same flow. Different velocities along the path.</h3>
      <p>The modeled flow is steady, but it is not uniform. As the marker travels through different locations, it encounters different velocity vectors.</p>
      <p>The path tells us where it went. The vectors help explain how it moved.</p>
      <p className="learn__model-note">This observation is within a prescribed kinematic model. It does not establish forces, vorticity, convergence or full storm dynamics.</p>
    </section>}
    {lessonActions}
    </section>
  </div>;
}
