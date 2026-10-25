import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref, type ReactNode } from "react";
import { TracerViewport, type TracerViewportHandle } from "../../ui/tracer/TracerViewport.js";
import { LEARN_MAX_STEPS, LEARN_TIME_SCALE } from "./createLearnSession.js";
import { createReadMotionSession } from "./createReadMotionSession.js";
import { READ_MOTION_ARROW_SCALE } from "./createReadMotionSession.js";
import { ReadMotionInspection } from "./ReadMotionInspection.js";
import { ReadMotionInvestigation } from "./ReadMotionInvestigation.js";
import { ReadMotionLegend } from "./ReadMotionLegend.js";
import type { LearnDepartureHandle } from "./LearnLessonNavigation.js";

export function LearnReadMotion({ departureRef, lessonActions, pausedForHelp = false }: {
  departureRef: Ref<LearnDepartureHandle>;
  pausedForHelp?: boolean;
  lessonActions?: ReactNode;
}) {
  const [lab, setLab] = useState(createReadMotionSession);
  const inspection = useMemo(() => new ReadMotionInspection(lab), [lab]);
  const [, refreshInspection] = useState(0);
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const [steps, setSteps] = useState(0);
  const [resetEpoch, setResetEpoch] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exit, setExit] = useState<{ label: string; action: () => void } | null>(null);
  const scene = useRef<TracerViewportHandle>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const exitTrigger = useRef<HTMLElement | null>(null);
  const complete = steps === LEARN_MAX_STEPS;
  const current = complete ? inspection.current() : null;
  const updateInspection = (action: () => void) => { action(); refreshInspection(value => value + 1); };
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => {
    if (!exit) return;
    const modal = dialog.current!;
    modal.showModal();
    return () => { modal.close(); exitTrigger.current?.focus(); };
  }, [exit]);
  useImperativeHandle(departureRef, () => ({
    requestLeave(label, action) {
      if (lab.stepBudget.completedSteps === 0) { action(); return; }
      exitTrigger.current = document.activeElement as HTMLElement;
      setExit({ label, action });
    },
  }), [lab]);
  const replay = () => {
    setLab(createReadMotionSession()); setSteps(0); setPaused(true); setStarted(false); setError(null);
    setResetEpoch(epoch => epoch + 1);
  };

  return <>
    <h1 ref={heading} tabIndex={-1}>Read the Motion</h1>
    <div className={`learn__layout${current ? " learn__layout--inspection" : ""}`}>
      {current ? <ReadMotionInvestigation current={current} reference={inspection.reference}
        sampleCount={lab.pathHistory.tracerCount === 0 ? 0 : lab.pathHistory.sampleCountFor(0)}
        inspecting={inspection.selectedIndex !== null}
        onSelect={index => updateInspection(() => inspection.select(index))}
        onSave={() => updateInspection(() => inspection.saveReference())}
        onClear={() => updateInspection(() => inspection.clearReference())} lessonActions={lessonActions} />
      : <section className="ui-panel learn__copy" aria-label="Read the Motion lesson">
        {!started ? <>
          <h2>Where is the airflow going — and how fast?</h2>
          <p>In Follow Motion, we watched two tracers take different paths. Now follow one tracer marker and its local velocity arrow.</p>
          <p>The arrow shows local airflow velocity at the tracer’s position: its direction and speed.</p>
          <ol className="learn__phases">
            <li><strong>Watch</strong> — Watch the marker and its velocity arrow during a short flight.</li>
            <li><strong>Investigate</strong> — After the flight, explore recorded moments and compare velocities.</li>
          </ol>
          <p>The flight takes about 12 seconds. Once it finishes, the timeline and measurements become available. You can pause and resume at any time.</p>
        </> : <>
          <p className="learn__phase" role="status">Recording the path · Phase 1 of 2</p>
          <p>Watch how the arrow changes. After the flight, use the timeline to inspect and compare the recorded motion.</p>
        </>}
        <p>The Demo airflow is steady. The marker samples different places as it travels; the field itself is not changing over time.</p>
        {lessonActions}
      </section>}
      <section className="learn__scene" aria-label="One-marker velocity observation">
        <div className="learn__viewport learn__motion-host">
          {error ? <p className="learn__view-error" role="alert">{error}</p> : <TracerViewport
            simulation={lab.simulation} pathHistory={lab.pathHistory} timestep={lab.timestep}
            paused={paused || exit !== null || pausedForHelp} timeScale={LEARN_TIME_SCALE} resetEpoch={resetEpoch}
            keepInactiveGlyphs sceneHandleRef={scene} sceneOptions={lab.sceneOptions}
            displayedParticlesSource={() => current?.position
              ? [{ ...lab.simulation.particles[0]!, position: current.position }]
              : lab.simulation.particles}
            velocityArrowSource={() => current
              ? current.kind === "available"
                ? { position: current.position, velocity: current.velocity, displayMetresPerMps: READ_MOTION_ARROW_SCALE }
                : null
              : lab.observeVelocity()}
            showGroundCursor={false} stepBudget={lab.stepBudget} suspendWhenHidden
            onSimulationAdvanced={() => setSteps(lab.stepBudget.completedSteps)}
            onViewportError={message => { setPaused(true); setError(message); }}
          />}
        </div>
        <div className="learn__scene-toolbar">
          <div className="learn__controls">
            {!complete && !error && <button type="button" className="ui-button ui-button--primary" onClick={() => {
              setStarted(true); setPaused(value => !value);
            }}>{!started ? "Start observation" : paused ? "Resume" : "Pause"}</button>}
            {(started || error) && <button type="button" className="ui-button" onClick={replay}>Replay</button>}
            {!error && <button type="button" className="ui-button" onClick={() => scene.current?.resetView()}>Reset View</button>}
          </div>
          <output aria-label="Flight model time">Model time: {lab.simulation.clock.time.toFixed(1)} s</output>
        </div>
        <ReadMotionLegend />
        <p>Drag to orbit; scroll to zoom</p>
        <details className="learn__details"><summary>Details</summary>
          <p>The arrow shows storm-relative velocity at the displayed position and model time: velocity relative to the prescribed storm motion C. Its tail is anchored at the marker.</p>
          <p>Arrow length represents speed, not distance travelled or predicted displacement. The display scale is fixed within each lesson, but differs between Read the Motion and Compare the Flow. Screen lengths cannot be compared directly across lessons; perspective and zoom also affect apparent length.</p>
          <p>Target playback: 10 model seconds per real second; slower devices may take longer. The flight stops after 120 model seconds.</p>
          <p>Reset View fits the recorded path and current arrow. It does not reset the observation.</p>
          <p>Inspecting history moves only the displayed marker and arrow. The flight clock stays at 120 seconds.</p>
        </details>
      </section>
    </div>
    {exit && <dialog ref={dialog} className="learn__exit-dialog" aria-labelledby="read-motion-exit-title"
      onCancel={event => { event.preventDefault(); setExit(null); }}>
      <h2 id="read-motion-exit-title">Leave this experiment?</h2>
      <p>Your marker and path will be discarded. They won't be saved.</p>
      <div className="learn__controls">
        <button type="button" className="ui-button" autoFocus onClick={() => setExit(null)}>Stay here</button>
        <button type="button" className="ui-button" onClick={exit.action}>Leave for {exit.label}</button>
      </div>
    </dialog>}
  </>;
}
