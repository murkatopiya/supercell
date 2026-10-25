import { useResourceDialog } from "./useResourceDialog.js";
import {
  useRef,
  type MouseEvent,
  type RefObject,
} from "react";
import {
  GLOSSARY_ANALYSIS,
  GLOSSARY_ANALYSIS_OVERLAY,
  GLOSSARY_ANALYSIS_T1,
  GLOSSARY_ANALYSIS_UNAVAILABLE,
  GLOSSARY_ATTRIBUTION_LEAD,
  GLOSSARY_EOL_ATTRIBUTION,
  GLOSSARY_GRADIENT,
  GLOSSARY_HISTORICAL_SAMPLE,
  GLOSSARY_IGRA_ATTRIBUTION,
  GLOSSARY_INTRO,
  GLOSSARY_NAV,
  GLOSSARY_OCCUPANCY_COLOR_CALLOUT,
  GLOSSARY_OCCUPANCY_TRAIL,
  GLOSSARY_OMEGA_H,
  GLOSSARY_PASSIVE_TRACER,
  GLOSSARY_RECORDED_TRAJECTORY,
  GLOSSARY_SOURCE,
  GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS,
  GLOSSARY_SUPPORT_STATES,
  GLOSSARY_T1_EQUATION,
  GLOSSARY_T1_EQUATION_COS,
  GLOSSARY_THETA,
  GLOSSARY_TITLE,
  GLOSSARY_V_TOTAL,
  GLOSSARY_V_TOTAL_EQUATION,
  GLOSSARY_VELOCITY_CONTRIBUTIONS,
  GLOSSARY_VELOCITY_WARNING,
  GLOSSARY_WHAT_IF,
  glossaryTermDefinition,
} from "./glossaryContent.js";

export interface GlossarySurfaceProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

function scrollGlossarySection(
  event: MouseEvent<HTMLAnchorElement>,
  body: HTMLDivElement | null,
) {
  event.preventDefault();
  const id = event.currentTarget.hash.slice(1);
  const target = document.getElementById(id);
  if (body === null || target === null) {
    return;
  }
  const top =
    target.getBoundingClientRect().top -
    body.getBoundingClientRect().top +
    body.scrollTop;
  body.scrollTo({ top, behavior: "smooth" });
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
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useResourceDialog(open, onClose, returnFocusRef, closeButtonRef);

  if (!open) {
    return null;
  }

  return (
    <div className="how-it-works" onClick={() => onCloseRef.current()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        className="how-it-works__dialog how-it-works__dialog--glossary"
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
        <nav className="glossary-nav" aria-label="Glossary sections">
          {GLOSSARY_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => scrollGlossarySection(event, bodyRef.current)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div ref={bodyRef} className="how-it-works__body">
          <section className="how-it-works__section glossary-intro">
            <p>{GLOSSARY_INTRO}</p>
          </section>

          <section
            id="glossary-velocity"
            className="how-it-works__section glossary-section"
          >
            <h3>Laboratory velocity</h3>
            <p>{GLOSSARY_V_TOTAL}</p>
            <pre className="glossary-equation">
              {GLOSSARY_V_TOTAL_EQUATION.replaceAll(" + ", "\n+ ")}
            </pre>
            <p className="glossary-callout">{GLOSSARY_VELOCITY_WARNING}</p>
            <dl className="glossary-list">
              {GLOSSARY_VELOCITY_CONTRIBUTIONS.map((contribution) => (
                <div key={contribution.key} className="glossary-list__item">
                  <dt className="glossary-term">{contribution.term}</dt>
                  <dd className="glossary-definition">
                    {contribution.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            id="glossary-source-analysis"
            className="how-it-works__section glossary-section"
          >
            <h3>Source and Analysis</h3>
            <p className="glossary-callout">
              {GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS}
            </p>
            <dl className="glossary-list">
              <div className="glossary-list__item">
                <dt className="glossary-term">Source</dt>
                <dd className="glossary-definition">{GLOSSARY_SOURCE}</dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">Analysis</dt>
                <dd className="glossary-definition">{GLOSSARY_ANALYSIS}</dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">Analysis unavailable</dt>
                <dd className="glossary-definition">
                  {GLOSSARY_ANALYSIS_UNAVAILABLE}
                </dd>
              </div>
            </dl>
          </section>

          <section
            id="glossary-trajectory"
            className="how-it-works__section glossary-section"
          >
            <h3>Trajectory diagnostics</h3>
            <dl className="glossary-list">
              <div className="glossary-list__item">
                <dt className="glossary-term">Passive tracer</dt>
                <dd className="glossary-definition">{GLOSSARY_PASSIVE_TRACER}</dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">Recorded trajectory</dt>
                <dd className="glossary-definition">
                  {GLOSSARY_RECORDED_TRAJECTORY}
                </dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">Historical sample</dt>
                <dd className="glossary-definition">
                  {GLOSSARY_HISTORICAL_SAMPLE}
                </dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">Analysis T1</dt>
                <dd className="glossary-definition">{GLOSSARY_ANALYSIS_T1}</dd>
              </div>
            </dl>
            <p className="how-it-works__equation">{GLOSSARY_T1_EQUATION}</p>
            <p className="how-it-works__equation">{GLOSSARY_T1_EQUATION_COS}</p>
            <dl className="glossary-list">
              <div className="glossary-list__item">
                <dt className="glossary-term glossary-term--symbol">ω_h</dt>
                <dd className="glossary-definition">{GLOSSARY_OMEGA_H}</dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term glossary-term--symbol">∇_h V_y</dt>
                <dd className="glossary-definition">{GLOSSARY_GRADIENT}</dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term glossary-term--symbol">θ</dt>
                <dd className="glossary-definition">{GLOSSARY_THETA}</dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">What-if geometry</dt>
                <dd className="glossary-definition">{GLOSSARY_WHAT_IF}</dd>
              </div>
            </dl>
          </section>

          <section
            id="glossary-support"
            className="how-it-works__section glossary-section"
          >
            <h3>Support states</h3>
            <dl className="glossary-support">
              {GLOSSARY_SUPPORT_STATES.map((entry) => {
                const { term, definition } = glossaryTermDefinition(entry);
                return (
                  <div key={term} className="glossary-support__item">
                    <dt className="glossary-term glossary-term--symbol">
                      {term}
                    </dt>
                    <dd className="glossary-definition">{definition}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section
            id="glossary-occupancy"
            className="how-it-works__section glossary-section"
          >
            <h3>Occupancy trail and Analysis T1 overlay</h3>
            <p className="glossary-callout">{GLOSSARY_OCCUPANCY_COLOR_CALLOUT}</p>
            <dl className="glossary-list">
              <div className="glossary-list__item">
                <dt className="glossary-term">Occupancy / tracer trail</dt>
                <dd className="glossary-definition">
                  {GLOSSARY_OCCUPANCY_TRAIL}
                </dd>
              </div>
              <div className="glossary-list__item">
                <dt className="glossary-term">Analysis T1 overlay</dt>
                <dd className="glossary-definition">
                  {GLOSSARY_ANALYSIS_OVERLAY}
                </dd>
              </div>
            </dl>
          </section>

          <section
            id="glossary-data"
            className="how-it-works__section glossary-section"
          >
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
