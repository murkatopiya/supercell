import { useEffect, useRef, type RefObject } from "react";
import {
  HOW_IT_WORKS_AIRFLOW_MARKS,
  HOW_IT_WORKS_EULERIAN,
  HOW_IT_WORKS_ENVIRONMENT_NOT_MODE,
  HOW_IT_WORKS_EXPERIMENT_HEADING,
  HOW_IT_WORKS_EXPLORE,
  HOW_IT_WORKS_EXPLORE_WORKFLOW,
  HOW_IT_WORKS_FLOW_COMETS,
  HOW_IT_WORKS_GRID,
  HOW_IT_WORKS_GUIDED,
  HOW_IT_WORKS_GUIDED_RELEASES,
  HOW_IT_WORKS_HODOGRAPH,
  HOW_IT_WORKS_HODOGRAPH_INTERACTION,
  HOW_IT_WORKS_HODOGRAPH_POINTS,
  HOW_IT_WORKS_NOT_FORECAST,
  HOW_IT_WORKS_NOT_SIMPLIFIED,
  HOW_IT_WORKS_OVERLAYS,
  HOW_IT_WORKS_PASSIVE,
  HOW_IT_WORKS_SCENE_CONTROLS,
  HOW_IT_WORKS_SPEED,
  HOW_IT_WORKS_TAIL,
  HOW_IT_WORKS_TITLE,
  HOW_IT_WORKS_TRACER,
  HOW_IT_WORKS_VISUALIZATION_HEADING,
  HOW_IT_WORKS_WHAT,
  type HowItWorksContext,
} from "./howItWorksContent.js";

export interface HowItWorksSurfaceProps {
  open: boolean;
  context: HowItWorksContext;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Shared How It Works overlay. Observes UI navigation; does not own lab state.
 * Overlay chrome lives in app.css `.how-it-works`:
 * position:fixed; inset:0; z-index:80 (above hodograph workspace 40).
 * docs/ui/12-how-it-works-and-onboarding.md
 */
export function HowItWorksSurface({
  open,
  context,
  onClose,
  returnFocusRef,
}: HowItWorksSurfaceProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      returnFocusRef.current?.focus();
    };
  }, [open, returnFocusRef]);

  if (!open) {
    return null;
  }

  const showExploreRelease = context !== "guided";
  const showGuidedRelease = context !== "explore";

  return (
    <div className="how-it-works" onClick={() => onCloseRef.current()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        className="how-it-works__dialog"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="how-it-works__header">
          <h2 id="how-it-works-title" className="how-it-works__title">
            {HOW_IT_WORKS_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="ui-button ui-button--subtle tracer-runtime-controls__button"
            onClick={() => onCloseRef.current()}
          >
            Close
          </button>
        </header>
        <div className="how-it-works__body">
          <section className="how-it-works__section">
            <h3>What is Supercell Explorer?</h3>
            <p>{HOW_IT_WORKS_WHAT}</p>
            <p>{HOW_IT_WORKS_NOT_FORECAST}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Guided and Explore</h3>
            <p className="how-it-works__group-title">Guided</p>
            <p>{HOW_IT_WORKS_GUIDED}</p>
            <p>You watch prepared scenarios chosen for a particular teaching claim.</p>
            <p className="how-it-works__group-title">Explore</p>
            <p>{HOW_IT_WORKS_EXPLORE}</p>
            <p>{HOW_IT_WORKS_NOT_SIMPLIFIED}</p>
            <p>{HOW_IT_WORKS_ENVIRONMENT_NOT_MODE}</p>
          </section>

          <section className="how-it-works__section">
            <h3>The 3D scene</h3>
            {context === "guided" ? (
              <p>
                The scene shows prepared tracers in a storm-relative laboratory.
                Explore also displays airflow marks on the same kind of scene.
              </p>
            ) : (
              <p>
                The scene shows tracers moving through prescribed storm-relative
                airflow.
              </p>
            )}
            <p className="how-it-works__group-title">Airflow marks</p>
            <p>{HOW_IT_WORKS_FLOW_COMETS}</p>
            <p>{HOW_IT_WORKS_AIRFLOW_MARKS}</p>
            <p>{HOW_IT_WORKS_EULERIAN}</p>
            <p className="how-it-works__group-title">Coordinate grid</p>
            <p>{HOW_IT_WORKS_GRID}</p>
            <p>
              The marked origin is a laboratory reference, not the storm center.
            </p>
            <p className="how-it-works__group-title">Scene controls</p>
            <p>{HOW_IT_WORKS_SCENE_CONTROLS}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Hodograph</h3>
            <p>{HOW_IT_WORKS_HODOGRAPH}</p>
            <p>{HOW_IT_WORKS_HODOGRAPH_POINTS}</p>
            <p>{HOW_IT_WORKS_OVERLAYS}</p>
            <p>{HOW_IT_WORKS_HODOGRAPH_INTERACTION}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Tracers</h3>
            <p>{HOW_IT_WORKS_TRACER}</p>
            <p>{HOW_IT_WORKS_PASSIVE}</p>
            {showExploreRelease ? (
              <>
                <p className="how-it-works__group-title">Releasing a tracer</p>
                <p>{HOW_IT_WORKS_EXPLORE_WORKFLOW}</p>
                <ul>
                  <li>Click a tracer to select it. Its tail is also clickable.</li>
                  <li>{HOW_IT_WORKS_TAIL}</li>
                  <li>Inspector describes the selected tracer.</li>
                  <li>
                    Undo / Redo reverse the last tracer releases. They do not
                    rewind simulation time.
                  </li>
                  <li>Clear tracers removes the current group.</li>
                </ul>
              </>
            ) : null}
            {showGuidedRelease ? <p>{HOW_IT_WORKS_GUIDED_RELEASES}</p> : null}
            {context === "guided" ? (
              <ul>
                <li>Click a tracer to select it. Its tail is also clickable.</li>
                <li>{HOW_IT_WORKS_TAIL}</li>
                <li>Inspector describes the selected tracer.</li>
              </ul>
            ) : null}
          </section>

          <section className="how-it-works__section">
            <h3>Experiment vs visualization</h3>
            <p className="how-it-works__group-title">
              {HOW_IT_WORKS_EXPERIMENT_HEADING}
            </p>
            <ul>
              <li>Environment</li>
              <li>tracer release</li>
              <li>prepared Guided experiment</li>
            </ul>
            <p className="how-it-works__group-title">
              {HOW_IT_WORKS_VISUALIZATION_HEADING}
            </p>
            <ul>
              <li>Grid</li>
              <li>Airflow view</li>
              <li>Highlight</li>
              <li>Depth cue</li>
              <li>hodograph zoom/pan</li>
              <li>camera / view controls</li>
            </ul>
            <p>{HOW_IT_WORKS_SPEED}</p>
            <p>
              Pause / Resume control whether laboratory time advances. Reset
              returns tracers and laboratory time to the start of the current
              experiment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
