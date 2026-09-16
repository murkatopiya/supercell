import { useState } from "react";
import { DEMO_SCENARIO } from "../../scenario/DEMO_SCENARIO.js";
import type { StormMotion } from "../../physics/environment/stormRelativeWind.js";
import {
  exploreEnvironmentHonesty,
  exploreEnvironmentLabel,
  EXPLORE_ENVIRONMENT_OPTIONS,
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  isExploreEnvironmentIdentity,
  type ExploreEnvironmentIdentity,
} from "../../explore/exploreEnvironmentIdentity.js";
import { ANALYSIS_UNAVAILABLE_COPY } from "../../app/publicDiagnosticCopy.js";

export interface ExploreEnvironmentSelectorProps {
  value: ExploreEnvironmentIdentity;
  onChange: (identity: ExploreEnvironmentIdentity) => void;
  analysisAvailable?: boolean;
  stormMotion?: Readonly<StormMotion>;
  onApplyStormMotion?: (next: StormMotion) => void;
  onRestoreStormMotion?: () => void;
}

/** Blank and nonfinite strings are never treated as a storm-motion component. */
export function parseStormMotionDraft(eastward: string, northward: string): StormMotion | null {
  const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  const eastText = eastward.trim(), northText = northward.trim();
  if (!decimal.test(eastText) || !decimal.test(northText)) return null;
  const east = Number(eastText), north = Number(northText);
  return Number.isFinite(east) && Number.isFinite(north)
    ? { eastward: east, northward: north } : null;
}

/**
 * Persistent Explore control for environment identity.
 * Lives under Storm-relative laboratory. Options come from
 * EXPLORE_ENVIRONMENT_OPTIONS.
 */
function StormMotionEditor({ stormMotion, onApplyStormMotion, onRestoreStormMotion }: {
  stormMotion: Readonly<StormMotion>;
  onApplyStormMotion: (next: StormMotion) => void;
  onRestoreStormMotion: () => void;
}) {
  const [eastDraft, setEastDraft] = useState(String(stormMotion?.eastward ?? DEMO_SCENARIO.stormMotion.eastward));
  const [northDraft, setNorthDraft] = useState(String(stormMotion?.northward ?? DEMO_SCENARIO.stormMotion.northward));
  const [draftError, setDraftError] = useState(false);
  const parsed = parseStormMotionDraft(eastDraft, northDraft);
  const unchanged = parsed !== null && stormMotion !== undefined &&
    parsed.eastward === stormMotion.eastward && parsed.northward === stormMotion.northward;
  const prescribed = DEMO_SCENARIO.stormMotion;
  const restoreUnchanged = stormMotion?.eastward === prescribed.eastward &&
    stormMotion.northward === prescribed.northward && unchanged;
  return (
      <section className="storm-motion-control" aria-label="Storm motion C controls">
        <h3 className="storm-motion-control__title">Storm motion C</h3>
        <p className="storm-motion-control__description">Prescribed laboratory motion, not observed storm motion.</p>
        <div className="storm-motion-control__fields">
          <label className="storm-motion-control__field">Eastward (m/s)
            <input className="ui-input" type="number" step="any" value={eastDraft}
              aria-invalid={draftError && parseStormMotionDraft(eastDraft, "0") === null}
              onChange={event => { setEastDraft(event.target.value); setDraftError(false); }} />
          </label>
          <label className="storm-motion-control__field">Northward (m/s)
            <input className="ui-input" type="number" step="any" value={northDraft}
              aria-invalid={draftError && parseStormMotionDraft("0", northDraft) === null}
              onChange={event => { setNorthDraft(event.target.value); setDraftError(false); }} />
          </label>
        </div>
        <div className="storm-motion-control__actions">
          <button className="ui-button ui-button--primary" type="button" disabled={unchanged} onClick={() => {
            if (!parsed) { setDraftError(true); return; }
            setDraftError(false);
            onApplyStormMotion(parsed);
          }}>Apply C</button>
          <button className="ui-button ui-button--subtle" type="button" disabled={restoreUnchanged} onClick={() => {
            setEastDraft(String(prescribed.eastward));
            setNorthDraft(String(prescribed.northward));
            setDraftError(false);
            onRestoreStormMotion();
          }}>Restore prescribed C</button>
        </div>
        {draftError ? <p className="storm-motion-control__error" role="alert">Enter finite numbers for both C components.</p> : null}
        <p className="storm-motion-control__hint">Changing C starts a new experiment and clears current tracers.</p>
      </section>
  );
}

export function ExploreEnvironmentSelector({
  value,
  onChange,
  stormMotion,
  onApplyStormMotion,
  onRestoreStormMotion,
}: ExploreEnvironmentSelectorProps) {
  return (
    <details className="explore-environment-disclosure">
      <summary className="explore-environment-disclosure__summary">
        <span className="explore-environment-disclosure__title">Environment &amp; storm motion</span>
        <span className="explore-environment-disclosure__value">
          {exploreEnvironmentLabel(value)} · C ({stormMotion?.eastward ?? DEMO_SCENARIO.stormMotion.eastward}, {stormMotion?.northward ?? DEMO_SCENARIO.stormMotion.northward}) m/s
        </span>
      </summary>
      <div className="explore-environment-disclosure__body">
        <label className="explore-environment-selector" htmlFor="explore-environment-selector">
          Environment
          <select id="explore-environment-selector" className="ui-select" value={value}
            onChange={(event) => {
              const next = event.target.value;
              if (isExploreEnvironmentIdentity(next)) onChange(next);
            }}>
            {EXPLORE_ENVIRONMENT_OPTIONS.map((option) => (
              <option key={option.identity} value={option.identity}>{option.label}</option>
            ))}
          </select>
        </label>
        {value !== EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED && stormMotion && onApplyStormMotion && onRestoreStormMotion ? (
          <StormMotionEditor key={value} stormMotion={stormMotion}
            onApplyStormMotion={onApplyStormMotion} onRestoreStormMotion={onRestoreStormMotion} />
        ) : null}
      </div>
    </details>
  );
}

export function ExploreLaboratoryAbout({ value, analysisAvailable }: {
  value: ExploreEnvironmentIdentity;
  analysisAvailable?: boolean;
}) {
  const honesty = exploreEnvironmentHonesty(value);
  return (
    <details className="explore-laboratory-about">
      <summary>About this laboratory</summary>
      <div className="workbench__column-note environment-clarity" aria-label="Environment data and limitations">
      <p>{honesty ? "Observed: environmental wind profile. Observation details are in Hodograph." : "Environmental wind: prescribed demonstration profile."}</p>
      <p>Prescribed: storm-local flow and storm motion.</p>
      <p>Not a reconstruction of a storm.</p>
      {analysisAvailable !== undefined ? (
        <p role="status">{analysisAvailable
          ? "Vertical-vorticity tilting diagnostic (T1) available along the recorded trajectory."
          : ANALYSIS_UNAVAILABLE_COPY}</p>
      ) : null}
      </div>
    </details>
  );
}
