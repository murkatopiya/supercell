import { ENVIRONMENT_SURFACE_ID } from "./EnvironmentSurface.js";

export interface EnvironmentAffordanceProps {
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Shared in-mode control for the on-demand Environment surface.
 * Not a top-level mode. docs/ui/07-app-navigation-and-mode-entry.md
 */
export function EnvironmentAffordance({
  expanded,
  onToggle,
}: EnvironmentAffordanceProps) {
  return (
    <button
      type="button"
      className="ui-button tracer-runtime-controls__button environment-affordance"
      aria-label="Environment"
      aria-expanded={expanded}
      aria-controls={ENVIRONMENT_SURFACE_ID}
      onClick={onToggle}
    >
      Environment
    </button>
  );
}
