import { useEffect, useRef, type RefObject } from "react";
import {
  HOW_IT_WORKS_ANALYSIS,
  HOW_IT_WORKS_ANALYSIS_UNAVAILABLE,
  HOW_IT_WORKS_BOUNDARY,
  HOW_IT_WORKS_CHOOSE_ENVIRONMENT,
  HOW_IT_WORKS_COLOR,
  HOW_IT_WORKS_COLOR_SCALE,
  HOW_IT_WORKS_EXPLORE_WORKFLOW,
  HOW_IT_WORKS_GUIDED_RELEASES,
  HOW_IT_WORKS_HISTORICAL_SAMPLE,
  HOW_IT_WORKS_NOT_FORECAST,
  HOW_IT_WORKS_RECORDED_TRAJECTORY,
  HOW_IT_WORKS_RELEASE_TRACER,
  HOW_IT_WORKS_SCENE_CONTROLS,
  HOW_IT_WORKS_SOURCE,
  HOW_IT_WORKS_SOURCE_ADVECTS_ANALYSIS_EXPLAINS,
  HOW_IT_WORKS_SPEED,
  HOW_IT_WORKS_T1_EQUATION,
  HOW_IT_WORKS_T1_EQUATION_COS,
  HOW_IT_WORKS_T1_GEOMETRY,
  HOW_IT_WORKS_TAIL,
  HOW_IT_WORKS_TITLE,
  HOW_IT_WORKS_VERIFY,
  HOW_IT_WORKS_WHAT,
  HOW_IT_WORKS_WHAT_IF,
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

  const showExploreWorkflow = context !== "guided";

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
            <h3>1. Choose an environment</h3>
            <p>{HOW_IT_WORKS_CHOOSE_ENVIRONMENT}</p>
          </section>

          <section className="how-it-works__section">
            <h3>2. Release a tracer</h3>
            {context === "guided" ? <p>{HOW_IT_WORKS_GUIDED_RELEASES}</p> : null}
            <p>{HOW_IT_WORKS_RELEASE_TRACER}</p>
            {showExploreWorkflow ? (
              <>
                <p className="how-it-works__group-title">Releasing a tracer</p>
                <p>{HOW_IT_WORKS_EXPLORE_WORKFLOW}</p>
              </>
            ) : null}
          </section>

          <section className="how-it-works__section">
            <h3>3. Read the recorded trajectory</h3>
            <p>{HOW_IT_WORKS_RECORDED_TRAJECTORY}</p>
            <p>{HOW_IT_WORKS_TAIL}</p>
          </section>

          <section className="how-it-works__section">
            <h3>4. Understand the color</h3>
            <p>{HOW_IT_WORKS_COLOR}</p>
            <p>{HOW_IT_WORKS_COLOR_SCALE}</p>
          </section>

          {showExploreWorkflow ? (
            <section className="how-it-works__section">
              <h3>5. Click a historical sample</h3>
              <p>{HOW_IT_WORKS_HISTORICAL_SAMPLE}</p>
            </section>
          ) : null}

          <section className="how-it-works__section">
            <h3>{showExploreWorkflow ? "6. Explain T1 geometrically" : "Explain T1 geometrically"}</h3>
            <p>{HOW_IT_WORKS_T1_GEOMETRY}</p>
            <p className="how-it-works__equation">{HOW_IT_WORKS_T1_EQUATION}</p>
            <p className="how-it-works__equation">{HOW_IT_WORKS_T1_EQUATION_COS}</p>
          </section>

          <section className="how-it-works__section">
            <h3>{showExploreWorkflow ? "7. Verify numerically" : "Verify numerically"}</h3>
            <p>{HOW_IT_WORKS_VERIFY}</p>
          </section>

          {showExploreWorkflow ? (
            <section className="how-it-works__section">
              <h3>8. Use what-if geometry</h3>
              <p>{HOW_IT_WORKS_WHAT_IF}</p>
            </section>
          ) : null}

          <section className="how-it-works__section">
            <h3>
              {showExploreWorkflow
                ? "9. Source vs Analysis"
                : "Source vs Analysis"}
            </h3>
            <p>{HOW_IT_WORKS_SOURCE}</p>
            <p>{HOW_IT_WORKS_ANALYSIS}</p>
            <p className="how-it-works__group-title">
              {HOW_IT_WORKS_SOURCE_ADVECTS_ANALYSIS_EXPLAINS}
            </p>
            <p>{HOW_IT_WORKS_ANALYSIS_UNAVAILABLE}</p>
          </section>

          <section className="how-it-works__section">
            <h3>
              {showExploreWorkflow
                ? "10. Scientific boundary"
                : "Scientific boundary"}
            </h3>
            <p>{HOW_IT_WORKS_BOUNDARY}</p>
            <p>{HOW_IT_WORKS_SPEED}</p>
            <p>{HOW_IT_WORKS_SCENE_CONTROLS}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
