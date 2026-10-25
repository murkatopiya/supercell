import { useEffect, useImperativeHandle, useRef, useState, type Ref, type ReactNode } from "react";
import { TracerViewport, type TracerViewportHandle } from "../../ui/tracer/TracerViewport.js";
import { createLearnSession, LEARN_MAX_STEPS, LEARN_TIME_SCALE } from "./createLearnSession.js";
import type { LearnDepartureHandle } from "./LearnLessonNavigation.js";
import { FollowMotionLegend } from "./FollowMotionLegend.js";

export function LearnFollowMotion({ departureRef, lessonActions, pausedForHelp = false }: {
  pausedForHelp?: boolean;
  departureRef?: Ref<LearnDepartureHandle>;
  lessonActions?: ReactNode;
}) {
  const [lab] = useState(createLearnSession);
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
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => {
    if (!exit) return;
    const modal = dialog.current!;
    modal.showModal();
    return () => { modal.close(); exitTrigger.current?.focus(); };
  }, [exit]);
  const leave = (label: string, action: () => void) => {
    if (lab.stepBudget.completedSteps === 0) { action(); return; }
    exitTrigger.current = document.activeElement as HTMLElement;
    setExit({ label, action });
  };
  useImperativeHandle(departureRef, () => ({ requestLeave: leave }));
  const replay = () => {
    lab.replay(); setSteps(0); setPaused(true); setStarted(false); setError(null);
    setResetEpoch(epoch => epoch + 1);
  };

  return <>
    <h1 ref={heading} tabIndex={-1}>Follow Motion</h1>
    <div className="learn__layout">
      <section className="ui-panel learn__copy" aria-label="Follow Motion lesson">
        {complete ? <section aria-labelledby="learn-result" role="status">
          <h2 id="learn-result">What this shows</h2>
          <p><strong>Same height. Different paths.</strong></p>
          <p>The model airflow varies from place to place. Following the tracers makes those differences visible.</p>
        </section> : started ? <>
          <p>Watch how the paths develop.</p>
          <p>The tracers move through the same model airflow, starting from different locations.</p>
        </> : <>
          <p>Two passive tracers, one model airflow.</p>
          <p>A passive tracer is a virtual object that moves with the model airflow. Its colored marker shows where it is.</p>
          <p>Both tracers start at the same height, but in different places.</p>
          <p className="learn__question">What do you think will happen?</p>
          <p>Will they follow the same path or different paths?</p>
        </>}
        {complete && <p className="learn__model-note"><strong>Model note:</strong> Tracer motion is calculated from the prescribed model velocity field. These passive tracers do not affect the airflow or represent individual real air parcels.</p>}
        {lessonActions}
      </section>
      <section className="learn__scene" aria-label="Two-marker experiment">
        <div className="learn__viewport learn__motion-host">
          {error ? <p className="learn__view-error" role="alert">{error}</p> : <TracerViewport
            simulation={lab.simulation} pathHistory={lab.pathHistory} timestep={lab.timestep}
            paused={paused || exit !== null || pausedForHelp} timeScale={LEARN_TIME_SCALE} resetEpoch={resetEpoch}
            keepInactiveGlyphs sceneHandleRef={scene} sceneOptions={lab.sceneOptions}
            showGroundCursor={false} stepBudget={lab.stepBudget} suspendWhenHidden
            onSimulationAdvanced={() => setSteps(lab.stepBudget.completedSteps)}
            onViewportError={message => { setPaused(true); setError(message); }}
          />}
          {!error && <p className="learn__height-caption">Both start 1 km above ground</p>}
        </div>
        <div className="learn__scene-toolbar">
          <div className="learn__controls">
            {!complete && !error && <button type="button" className="ui-button ui-button--primary" onClick={() => {
              setStarted(true); setPaused(value => !value);
            }}>{!started ? "Start" : paused ? "Resume" : "Pause"}</button>}
            {(started || error) && <button type="button" className="ui-button" onClick={replay}>Replay</button>}
            {!error && <button type="button" className="ui-button" onClick={() => scene.current?.resetView()}>Reset View</button>}
          </div>
          <output aria-label="Model time">Model time: {lab.simulation.clock.time.toFixed(1)} s</output>
        </div>
        <FollowMotionLegend />
        <p>Drag to orbit; scroll to zoom</p>
        <details className="learn__details">
          <summary>Details</summary>
          <p>Target playback: 10 model seconds per real second; slower devices may take longer.</p>
          <p>Reset View fits the starts and paths recorded so far. It does not reset the experiment.</p>
        </details>
      </section>
    </div>
    {exit && <dialog ref={dialog} className="learn__exit-dialog" aria-labelledby="learn-exit-title"
      onCancel={event => { event.preventDefault(); setExit(null); }}>
      <h2 id="learn-exit-title">Leave this experiment?</h2>
      <p>Your markers and paths will be discarded. They won't be saved.</p>
      <div className="learn__controls">
        <button type="button" className="ui-button" autoFocus onClick={() => setExit(null)}>Stay here</button>
        <button type="button" className="ui-button" onClick={exit.action}>Leave for {exit.label}</button>
      </div>
    </dialog>}
  </>;
}
