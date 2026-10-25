import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createCompareFlowSession } from "./createCompareFlowSession.js";
import type { CompareFlowMeasurement } from "./CompareFlowMeasurement.js";
import { CompareFlowViewport } from "./CompareFlowViewport.js";
import { offsetCompareFlowB, type CompareFlowDirection, type PlacementResult } from "./CompareFlowPlacement.js";
import { TRACER_COLORS } from "../../rendering/tracerObserveSlot.js";

function ProbeValues({ label, measurement }: { label: string; measurement: CompareFlowMeasurement }) {
  const value = (key: "speed" | "vertical" | "eastward" | "northward") => {
    if (measurement.kind !== "available") return "Unavailable";
    const n = measurement[key];
    const formatted = n !== 0 && Math.abs(n) < 0.005 ? (n < 0 ? "−<0.01" : "+<0.01")
      : `${key !== "speed" && n > 0 ? "+" : ""}${n.toFixed(2)}`;
    return `${formatted} m/s`;
  };
  return <section aria-label={`Probe ${label}`} className="compare-flow__probe" style={{ borderTopColor: `#${TRACER_COLORS[label === "A" ? 0 : 1].toString(16)}` }}>
    <h3>Probe {label}</h3>
    <p className="compare-flow__probe-role">{label === "A" ? "Fixed reference point." : "Movable measurement point; stationary while measured."}</p>
    <p role="status" className="compare-flow__measurement-status">{measurement.kind === "unavailable" ? "Velocity could not be measured at this point." : ""}</p>
    <dl className="read-motion__values">
      <div className="read-motion__primary"><dt>Speed</dt><dd>{value("speed")}</dd></div>
      <div className="read-motion__primary"><dt>Vertical velocity</dt><dd>{value("vertical")}</dd></div>
    </dl>
    <details className="learn__details read-motion__components"><summary>Show horizontal components</summary>
      <dl className="read-motion__values"><div><dt>Eastward</dt><dd>{value("eastward")}</dd></div>
        <div><dt>Northward</dt><dd>{value("northward")}</dd></div></dl>
    </details>
  </section>;
}

export function LearnCompareFlow({ pausedForHelp = false, lessonActions }: { pausedForHelp?: boolean; lessonActions?: ReactNode }) {
  // Static session exists before and independently of the viewport effect.
  const [session] = useState(createCompareFlowSession);
  const [snapshot, setSnapshot] = useState(session.initialB);
  const current = useRef(snapshot);
  const [placing, setPlacing] = useState(false);
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState("");
  const moveButton = useRef<HTMLButtonElement>(null);
  const measurements = useRef<HTMLDivElement>(null);
  const boundaryMessages = useRef(new Set<CompareFlowDirection>());
  const endPlacement = useCallback((returnFocus: boolean) => {
    setPlacing(false);
    if (returnFocus) moveButton.current?.focus();
  }, []);
  useLayoutEffect(() => { if (pausedForHelp) setPlacing(false); }, [pausedForHelp]);
  useLayoutEffect(() => {
    if (placing) measurements.current?.scrollIntoView({ block: "end", behavior: "instant" });
  }, [placing]);
  const publish = useCallback((result: PlacementResult) => {
    if (result.kind === "invalid") {
      setStatus(result.reason === "bounds" ? "Choose a point inside the highlighted comparison area."
        : "That view does not give a usable point on the plane. Change the view or use the direction buttons.");
      return;
    }
    const p = current.current.measurement.position;
    if (p.x === result.position.x && p.z === result.position.z) return;
    const next = session.observeB(result.position);
    current.current = next; setSnapshot(next);
    boundaryMessages.current.clear();
    setStatus(next.measurement.kind === "available" ? "B position updated." : "Velocity could not be measured at this point.");
  }, [session]);
  const offset = (direction: CompareFlowDirection) => {
    const p = current.current.measurement.position;
    const next = offsetCompareFlowB(p, direction);
    if (next === p) {
      if (!boundaryMessages.current.has(direction)) {
        boundaryMessages.current.add(direction); setStatus("B has reached the edge of the comparison area.");
      }
      return;
    }
    publish({ kind: "valid", position: next });
    if (offsetCompareFlowB(next, direction) === next) {
      boundaryMessages.current.add(direction); setStatus("B has reached the edge of the comparison area.");
    }
  };
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <>
    <h1 ref={heading} tabIndex={-1}>Compare the Flow</h1>
    <div className="learn__layout compare-flow__layout">
      <section className="ui-panel learn__copy compare-flow__copy" aria-label="Static comparison">
        <h2>Does the airflow move the same way everywhere?</h2>
        <p>A and B are probes held at two different places, not particles carried by the air.</p>
        <p>Both probes sample the same model field at 0 s and a height of 1000 m.</p>
        <p>Each arrow shows the local 3D velocity. Both arrows use the same length scale: a longer arrow means a greater speed.</p>
        <p className="learn__question">Move B around the plane. What changes?</p>
        <section className="compare-flow__controls" aria-label="Probe B position controls">
          <div className="learn__controls">
            <button ref={moveButton} type="button" className="ui-button" disabled={!available || pausedForHelp}
              aria-pressed={placing} onClick={() => { if (placing) endPlacement(true); else { setPlacing(true); setStatus(""); } }}>
              {placing ? "Done moving B" : "Move B"}</button>
            <button type="button" className="ui-button" onClick={() => {
              current.current = session.initialB; setSnapshot(session.initialB); setPlacing(false);
              boundaryMessages.current.clear(); setStatus("B returned to its starting position.");
            }}>Reset B</button>
          </div>
          <p className="learn__phase">{placing ? "Place B" : "Inspect"}</p>
          {placing && <p>Choose a position for B on the highlighted plane, or use the direction buttons. Escape or Done moving B returns to Inspect.</p>}
          <div className="compare-flow__directions" role="group" aria-label="Move B in 100 metre steps">
            {(["west", "east", "north", "south"] as const).map(direction => <button key={direction} type="button" className="ui-button"
              aria-label={`Move B ${direction}`} aria-disabled={offsetCompareFlowB(snapshot.measurement.position, direction) === snapshot.measurement.position}
              onClick={() => offset(direction)}>{direction[0]!.toUpperCase() + direction.slice(1)} · 100 m</button>)}
          </div>
          <p className="learn__model-note">Relative steps are 100 m; the final step to an edge can be shorter.</p>
          <p className="compare-flow__position" aria-label="B coordinates">B: East {snapshot.measurement.position.x.toFixed(2)} m · North {(-snapshot.measurement.position.z).toFixed(2)} m</p>
          <p role="status" aria-live="polite" className="compare-flow__status">{status}</p>
          <p>Moving B changes where we measure. Model time stays at 0 s.</p>
          <p className="learn__model-note">B stays 1000 m above model ground.</p>
        </section>
        <p>Different readings at different places show spatial variation in this prescribed field. The field is not changing with time.</p>
        <p className="learn__model-note">These are local velocities in a prescribed model field. They do not by themselves establish forces, vorticity, convergence or the dynamics of a real storm.</p>
        {lessonActions}
      </section>
      <CompareFlowViewport session={session} snapshot={snapshot} placing={placing} onPlacement={publish}
        measurements={<>
          <div ref={measurements} className="compare-flow__measurements" aria-label="Probe measurements" style={{ scrollMarginBlockEnd: 12 }}>
            <ProbeValues label="A" measurement={session.a} /><ProbeValues label="B" measurement={snapshot.measurement} />
          </div>
          <p className="learn__model-note">Storm-relative velocity · Velocities are in m/s. Positive vertical velocity is upward; negative is downward. Negative Eastward or Northward means westward or southward.</p>
        </>}
        onAvailability={setAvailable} onEndPlacement={endPlacement} pausedForHelp={pausedForHelp} />
    </div>
  </>;
}
