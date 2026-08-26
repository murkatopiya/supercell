import { ENVIRONMENT_SURFACE_ID } from "./EnvironmentSurface.js";

export interface EnvironmentAffordanceProps {
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Shared header control for the on-demand Environment surface.
 * docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md §10.2
 */
export function EnvironmentAffordance({
  expanded,
  onToggle,
}: EnvironmentAffordanceProps) {
  return (
    <button
      type="button"
      className="tracer-runtime-controls__button environment-affordance"
      aria-label="Environment"
      aria-expanded={expanded}
      aria-controls={ENVIRONMENT_SURFACE_ID}
      onClick={onToggle}
    >
      Environment
    </button>
  );
}
