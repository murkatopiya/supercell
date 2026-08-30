import {
  useEffect,
  useRef,
  type MouseEvent,
  type RefObject,
} from "react";
import { ANALYSIS_MECHANISM_GLYPH_KEY_V1 } from "../ui/tracer/analysisMechanismGlyphKeyV1.js";
import {
  USER_GUIDE_CONTROLS,
  USER_GUIDE_EXPLORE_SCOPE,
  USER_GUIDE_GLYPH_ARTISTIC,
  USER_GUIDE_GLYPH_CYAN,
  USER_GUIDE_GLYPH_DASHED,
  USER_GUIDE_GLYPH_MEANING,
  USER_GUIDE_GLYPH_WHEN,
  USER_GUIDE_GLYPH_YELLOW,
  USER_GUIDE_HISTORY_CURRENT,
  USER_GUIDE_HISTORY_FOLLOW,
  USER_GUIDE_HISTORY_LEAD,
  USER_GUIDE_HISTORY_SAMPLE,
  USER_GUIDE_INTRO,
  USER_GUIDE_INTRO_SIBLINGS,
  USER_GUIDE_MORE_ATTRIBUTION,
  USER_GUIDE_MORE_GLOSSARY,
  USER_GUIDE_MORE_HOW_IT_WORKS,
  USER_GUIDE_NAV,
  USER_GUIDE_RELEASE_FLOW,
  USER_GUIDE_RELEASE_NO_ADD,
  USER_GUIDE_RELEASE_PLACEMENT,
  USER_GUIDE_RESET_CLEAR,
  USER_GUIDE_RESET_ENVIRONMENT,
  USER_GUIDE_RESET_LANDING,
  USER_GUIDE_RESET_SIMULATION,
  USER_GUIDE_RUN_PLAYBACK,
  USER_GUIDE_RUN_SPEED,
  USER_GUIDE_RUN_TRAIL,
  USER_GUIDE_SELECT_HOW,
  USER_GUIDE_SELECT_INSPECTOR,
  USER_GUIDE_START_ENVIRONMENT,
  USER_GUIDE_START_OPEN,
  USER_GUIDE_START_OTHER_ENVIRONMENTS,
  USER_GUIDE_START_WORKSPACE,
  USER_GUIDE_SUPPORT,
  USER_GUIDE_T1_COLOR,
  USER_GUIDE_T1_GAPS,
  USER_GUIDE_T1_LEGEND,
  USER_GUIDE_T1_NOT_SPIN,
  USER_GUIDE_T1_SCALE,
  USER_GUIDE_T1_WHAT,
  USER_GUIDE_TITLE,
  USER_GUIDE_UNAVAILABLE_LEAD,
  USER_GUIDE_UNAVAILABLE_MOORE,
  USER_GUIDE_VERIFY_WHERE,
  USER_GUIDE_VIEW_AIRFLOW,
  USER_GUIDE_VIEW_FOLLOW,
  USER_GUIDE_VIEW_FOCUS,
  USER_GUIDE_VIEW_GRID,
  USER_GUIDE_VIEW_HODOGRAPH,
  USER_GUIDE_VIEW_ORBIT,
  USER_GUIDE_WHAT_IF_DOES,
  USER_GUIDE_WHAT_IF_DOES_NOT,
} from "./userGuideContent.js";

export interface UserGuideSurfaceProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

function scrollUserGuideSection(
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
 * Public User Guide overlay. Reuses How It Works help-chrome.
 * Overlay chrome lives in app.css `.how-it-works`:
 * position:fixed; inset:0; z-index:80 (above hodograph workspace 40).
 * docs/ui/16-user-guide.md
 */
export function UserGuideSurface({
  open,
  onClose,
  returnFocusRef,
}: UserGuideSurfaceProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
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

  const glyph = ANALYSIS_MECHANISM_GLYPH_KEY_V1;
  const legend = USER_GUIDE_T1_LEGEND;

  return (
    <div className="how-it-works" onClick={() => onCloseRef.current()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-guide-title"
        className="how-it-works__dialog how-it-works__dialog--user-guide"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="how-it-works__header">
          <div className="user-guide__heading">
            <p className="user-guide__kicker">Practical manual</p>
            <h2 id="user-guide-title" className="how-it-works__title">
              {USER_GUIDE_TITLE}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="ui-button ui-button--subtle tracer-runtime-controls__button"
            onClick={() => onCloseRef.current()}
          >
            Close
          </button>
        </header>
        <nav className="glossary-nav" aria-label="User Guide sections">
          {USER_GUIDE_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => scrollUserGuideSection(event, bodyRef.current)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div ref={bodyRef} className="how-it-works__body">
          <section className="how-it-works__section glossary-intro">
            <p>{USER_GUIDE_INTRO}</p>
            <p>{USER_GUIDE_INTRO_SIBLINGS}</p>
            <p>{USER_GUIDE_EXPLORE_SCOPE}</p>
          </section>

          <section
            id="user-guide-start"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">1</span>
              Getting started
            </h3>
            <p>{USER_GUIDE_START_OPEN}</p>
            <p>{USER_GUIDE_START_ENVIRONMENT}</p>
            <p>{USER_GUIDE_START_OTHER_ENVIRONMENTS}</p>
            <div className="user-guide-workspace" aria-hidden="true">
              <div className="user-guide-workspace__col">
                <span className="user-guide-workspace__label">Left</span>
                Environment · Release · Runtime · View
              </div>
              <div className="user-guide-workspace__col user-guide-workspace__col--scene">
                <span className="user-guide-workspace__label">Center</span>
                3D laboratory
              </div>
              <div className="user-guide-workspace__col">
                <span className="user-guide-workspace__label">Right</span>
                Inspector · Analysis
              </div>
            </div>
            <p>{USER_GUIDE_START_WORKSPACE}</p>
          </section>

          <section
            id="user-guide-release"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">2</span>
              Releasing tracers
            </h3>
            <p className="user-guide-flow">{USER_GUIDE_RELEASE_FLOW}</p>
            <p>{USER_GUIDE_RELEASE_PLACEMENT}</p>
            <p className="glossary-callout">{USER_GUIDE_RELEASE_NO_ADD}</p>
            <dl className="user-guide-controls">
              {USER_GUIDE_CONTROLS.map((control) => (
                <div key={control.name} className="user-guide-controls__item">
                  <dt>{control.name}</dt>
                  <dd>{control.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            id="user-guide-run"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">3</span>
              Running the experiment
            </h3>
            <p>{USER_GUIDE_RUN_PLAYBACK}</p>
            <p>{USER_GUIDE_RUN_SPEED}</p>
            <p>{USER_GUIDE_RUN_TRAIL}</p>
          </section>

          <section
            id="user-guide-view"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">4</span>
              Using the 3D view
            </h3>
            <dl className="user-guide-controls">
              <div className="user-guide-controls__item">
                <dt>Orbit / pan / zoom</dt>
                <dd>{USER_GUIDE_VIEW_ORBIT}</dd>
              </div>
              <div className="user-guide-controls__item">
                <dt>Grid</dt>
                <dd>{USER_GUIDE_VIEW_GRID}</dd>
              </div>
              <div className="user-guide-controls__item">
                <dt>Hodograph</dt>
                <dd>{USER_GUIDE_VIEW_HODOGRAPH}</dd>
              </div>
              <div className="user-guide-controls__item">
                <dt>Follow</dt>
                <dd>{USER_GUIDE_VIEW_FOLLOW}</dd>
              </div>
              <div className="user-guide-controls__item">
                <dt>Focus sample</dt>
                <dd>{USER_GUIDE_VIEW_FOCUS}</dd>
              </div>
            </dl>
            <p>{USER_GUIDE_VIEW_AIRFLOW}</p>
          </section>

          <section
            id="user-guide-select"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">5</span>
              Selecting a tracer
            </h3>
            <p>{USER_GUIDE_SELECT_HOW}</p>
            <p>{USER_GUIDE_SELECT_INSPECTOR}</p>
          </section>

          <section
            id="user-guide-history"
            className="how-it-works__section user-guide-section user-guide-section--featured"
          >
            <h3>
              <span className="user-guide__step">6</span>
              Inspecting trajectory history
            </h3>
            <p className="user-guide-featured">{USER_GUIDE_HISTORY_LEAD}</p>
            <div className="user-guide-compare">
              <article className="user-guide-compare__card">
                <h4>Current selection</h4>
                <p>{USER_GUIDE_HISTORY_CURRENT}</p>
              </article>
              <article className="user-guide-compare__card user-guide-compare__card--accent">
                <h4>Historical sample</h4>
                <p>{USER_GUIDE_HISTORY_SAMPLE}</p>
              </article>
            </div>
            <p>{USER_GUIDE_HISTORY_FOLLOW}</p>
          </section>

          <section
            id="user-guide-t1"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">7</span>
              Reading Analysis T1
            </h3>
            <p>{USER_GUIDE_T1_WHAT}</p>
            <div className="user-guide-t1-legend">
              <p className="user-guide-t1-legend__title">{legend.title}</p>
              <div
                className="user-guide-t1-legend__ramp"
                style={{ backgroundImage: legend.gradientCss }}
                role="img"
                aria-label="cool negative, neutral zero, warm positive"
              />
              <div className="user-guide-t1-legend__ticks">
                <span>
                  {legend.negativeLabel} {legend.units}
                </span>
                <span>{legend.zeroLabel}</span>
                <span>
                  {legend.positiveLabel} {legend.units}
                </span>
              </div>
              <p className="user-guide-t1-legend__note">{legend.supportingCopy}</p>
            </div>
            <p>{USER_GUIDE_T1_COLOR}</p>
            <p>{USER_GUIDE_T1_SCALE}</p>
            <p>{USER_GUIDE_T1_GAPS}</p>
            <p className="glossary-callout">{USER_GUIDE_T1_NOT_SPIN}</p>
          </section>

          <section
            id="user-guide-glyph"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">8</span>
              Mechanism glyph
            </h3>
            <p>{USER_GUIDE_GLYPH_WHEN}</p>
            <div
              className="user-guide-glyph-key"
              aria-label="Mechanism glyph key"
            >
              <GlyphKeyRow
                color={glyph.omegaColorCss}
                dashed={false}
                opacity={1}
                label={USER_GUIDE_GLYPH_CYAN}
              />
              <GlyphKeyRow
                color={glyph.actualGradientColorCss}
                dashed={false}
                opacity={1}
                label={USER_GUIDE_GLYPH_YELLOW}
              />
              <GlyphKeyRow
                color={glyph.hypotheticalGradientColorCss}
                dashed
                opacity={glyph.hypotheticalOpacity}
                dashArray={`${glyph.dashSize} ${glyph.gapSize}`}
                label={USER_GUIDE_GLYPH_DASHED}
              />
            </div>
            <p>{USER_GUIDE_GLYPH_MEANING}</p>
            <p>{USER_GUIDE_GLYPH_ARTISTIC}</p>
          </section>

          <section
            id="user-guide-verify"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">9</span>
              Verification &amp; What-if
            </h3>
            <p>{USER_GUIDE_VERIFY_WHERE}</p>
            <p>{USER_GUIDE_WHAT_IF_DOES}</p>
            <p className="user-guide-dont">{USER_GUIDE_WHAT_IF_DOES_NOT}</p>
          </section>

          <section
            id="user-guide-unavailable"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">10</span>
              When a diagnostic is unavailable
            </h3>
            <p>{USER_GUIDE_UNAVAILABLE_LEAD}</p>
            <dl className="user-guide-support">
              {USER_GUIDE_SUPPORT.map((entry) => (
                <div key={entry.code} className="user-guide-support__item">
                  <dt>{entry.code}</dt>
                  <dd>{entry.meaning}</dd>
                </div>
              ))}
            </dl>
            <p>{USER_GUIDE_UNAVAILABLE_MOORE}</p>
          </section>

          <section
            id="user-guide-reset"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">11</span>
              Reset / start another experiment
            </h3>
            <p>{USER_GUIDE_RESET_SIMULATION}</p>
            <p>{USER_GUIDE_RESET_CLEAR}</p>
            <p>{USER_GUIDE_RESET_ENVIRONMENT}</p>
            <p>{USER_GUIDE_RESET_LANDING}</p>
          </section>

          <section
            id="user-guide-more"
            className="how-it-works__section user-guide-section"
          >
            <h3>
              <span className="user-guide__step">12</span>
              Where to learn more
            </h3>
            <ul className="user-guide-more">
              <li>{USER_GUIDE_MORE_HOW_IT_WORKS}</li>
              <li>{USER_GUIDE_MORE_GLOSSARY}</li>
              <li>{USER_GUIDE_MORE_ATTRIBUTION}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function GlyphKeyRow({
  color,
  dashed,
  opacity,
  dashArray,
  label,
}: {
  color: string;
  dashed: boolean;
  opacity: number;
  dashArray?: string;
  label: string;
}) {
  return (
    <div className="user-guide-glyph-key__row">
      <svg
        className="user-guide-glyph-key__sample"
        viewBox="0 0 40 12"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="2"
          y1="6"
          x2="28"
          y2="6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity={opacity}
          strokeDasharray={dashed ? dashArray : undefined}
        />
        <polygon
          points="38,6 28,2.5 28,9.5"
          fill={color}
          fillOpacity={opacity}
        />
      </svg>
      <span className="user-guide-glyph-key__label">{label}</span>
    </div>
  );
}
