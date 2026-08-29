import {
  EXPLORE_ENVIRONMENT_OPTIONS,
  isExploreEnvironmentIdentity,
  type ExploreEnvironmentIdentity,
} from "../../explore/exploreEnvironmentIdentity.js";

export interface ExploreEnvironmentSelectorProps {
  value: ExploreEnvironmentIdentity;
  onChange: (identity: ExploreEnvironmentIdentity) => void;
}

/**
 * Persistent Explore header control for environment identity.
 * Options come from EXPLORE_ENVIRONMENT_OPTIONS.
 */
export function ExploreEnvironmentSelector({
  value,
  onChange,
}: ExploreEnvironmentSelectorProps) {
  return (
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
  );
}
