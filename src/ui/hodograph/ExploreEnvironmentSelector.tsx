import {
  exploreEnvironmentHonesty,
  EXPLORE_ENVIRONMENT_OPTIONS,
  isExploreEnvironmentIdentity,
  type ExploreEnvironmentIdentity,
} from "../../explore/exploreEnvironmentIdentity.js";
import { ANALYSIS_UNAVAILABLE_COPY } from "../../app/publicDiagnosticCopy.js";

export interface ExploreEnvironmentSelectorProps {
  value: ExploreEnvironmentIdentity;
  onChange: (identity: ExploreEnvironmentIdentity) => void;
  analysisAvailable?: boolean;
}

/**
 * Persistent Explore control for environment identity.
 * Lives under Storm-relative laboratory. Options come from
 * EXPLORE_ENVIRONMENT_OPTIONS.
 */
export function ExploreEnvironmentSelector({
  value,
  onChange,
  analysisAvailable,
}: ExploreEnvironmentSelectorProps) {
  const honesty = exploreEnvironmentHonesty(value);
  return (
    <>
    <label
      className="explore-environment-selector"
      htmlFor="explore-environment-selector"
    >
      Environment
      <select
        id="explore-environment-selector"
        className="ui-select"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (isExploreEnvironmentIdentity(next)) {
            onChange(next);
          }
        }}
      >
        {EXPLORE_ENVIRONMENT_OPTIONS.map((option) => (
          <option key={option.identity} value={option.identity}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
    </>
  );
}
