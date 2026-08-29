import { useEffect, useRef, type RefObject } from "react";
import {
  GLOSSARY_ANALYSIS,
  GLOSSARY_ANALYSIS_OVERLAY,
  GLOSSARY_ANALYSIS_T1,
  GLOSSARY_ANALYSIS_UNAVAILABLE,
  GLOSSARY_ATTRIBUTION_LEAD,
  GLOSSARY_BOUNDARY,
  GLOSSARY_COLUMN_UNAVAILABLE,
  GLOSSARY_EOL_ATTRIBUTION,
  GLOSSARY_FULL,
  GLOSSARY_GRADIENT,
  GLOSSARY_HISTORICAL_SAMPLE,
  GLOSSARY_IGRA_ATTRIBUTION,
  GLOSSARY_INTRO,
  GLOSSARY_OCCUPANCY_TRAIL,
  GLOSSARY_OOD,
  GLOSSARY_OMEGA_H,
  GLOSSARY_PASSIVE_TRACER,
  GLOSSARY_RECORDED_TRAJECTORY,
  GLOSSARY_SOURCE,
  GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS,
  GLOSSARY_T1_EQUATION,
  GLOSSARY_T1_EQUATION_COS,
  GLOSSARY_THETA,
  GLOSSARY_TITLE,
  GLOSSARY_V_TOTAL,
  GLOSSARY_V_TOTAL_EQUATION,
  GLOSSARY_VELOCITY_CONTRIBUTIONS,
  GLOSSARY_VELOCITY_WARNING,
  GLOSSARY_WHAT_IF,
} from "./glossaryContent.js";

export interface GlossarySurfaceProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Public Glossary overlay. Reuses How It Works help-chrome.
 * Overlay chrome lives in app.css `.how-it-works`.
 */
export function GlossarySurface({
  open,
  onClose,
  returnFocusRef,
}: GlossarySurfaceProps) {
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

  return (
    <div className="how-it-works" onClick={() => onCloseRef.current()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        className="how-it-works__dialog"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="how-it-works__header">
          <h2 id="glossary-title" className="how-it-works__title">
            {GLOSSARY_TITLE}
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
            <p>{GLOSSARY_INTRO}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Laboratory velocity</h3>
            <p>{GLOSSARY_V_TOTAL}</p>
            <p className="how-it-works__equation">{GLOSSARY_V_TOTAL_EQUATION}</p>
            {GLOSSARY_VELOCITY_CONTRIBUTIONS.map((contribution) => (
              <div key={contribution.key}>
                <p className="how-it-works__group-title">{contribution.term}</p>
                <p>{contribution.definition}</p>
              </div>
            ))}
            <p>{GLOSSARY_VELOCITY_WARNING}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Source and Analysis</h3>
            <p>{GLOSSARY_SOURCE}</p>
            <p>{GLOSSARY_ANALYSIS}</p>
            <p className="how-it-works__group-title">
              {GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS}
            </p>
            <p>{GLOSSARY_ANALYSIS_UNAVAILABLE}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Trajectory diagnostics</h3>
            <p className="how-it-works__group-title">Passive tracer</p>
            <p>{GLOSSARY_PASSIVE_TRACER}</p>
            <p className="how-it-works__group-title">Recorded trajectory</p>
            <p>{GLOSSARY_RECORDED_TRAJECTORY}</p>
            <p className="how-it-works__group-title">Historical sample</p>
            <p>{GLOSSARY_HISTORICAL_SAMPLE}</p>
            <p className="how-it-works__group-title">Analysis T1</p>
            <p>{GLOSSARY_ANALYSIS_T1}</p>
            <p className="how-it-works__equation">{GLOSSARY_T1_EQUATION}</p>
            <p className="how-it-works__equation">{GLOSSARY_T1_EQUATION_COS}</p>
            <p className="how-it-works__group-title">ω_h</p>
            <p>{GLOSSARY_OMEGA_H}</p>
            <p className="how-it-works__group-title">∇_h V_y</p>
            <p>{GLOSSARY_GRADIENT}</p>
            <p className="how-it-works__group-title">θ</p>
            <p>{GLOSSARY_THETA}</p>
            <p className="how-it-works__group-title">What-if geometry</p>
            <p>{GLOSSARY_WHAT_IF}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Support states</h3>
            <p>{GLOSSARY_FULL}</p>
            <p>{GLOSSARY_BOUNDARY}</p>
            <p>{GLOSSARY_OOD}</p>
            <p>{GLOSSARY_COLUMN_UNAVAILABLE}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Occupancy trail and Analysis T1 overlay</h3>
            <p>{GLOSSARY_OCCUPANCY_TRAIL}</p>
            <p>{GLOSSARY_ANALYSIS_OVERLAY}</p>
          </section>

          <section className="how-it-works__section">
            <h3>Dataset attribution</h3>
            <p>{GLOSSARY_ATTRIBUTION_LEAD}</p>
            <p>{GLOSSARY_EOL_ATTRIBUTION}</p>
            <p>{GLOSSARY_IGRA_ATTRIBUTION}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
