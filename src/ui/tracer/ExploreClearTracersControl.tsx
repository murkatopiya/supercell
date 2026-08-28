export interface ExploreClearTracersControlProps {
  tracerCount: number;
  onClear: () => void;
}

export const CLEAR_TRACERS_EMPTY_REASON = "No tracers to clear.";

export function requestClearTracers(
  tracerCount: number,
  onClear: () => void,
): void {
  if (tracerCount === 0) {
    return;
  }
  onClear();
}

/**
 * Explore occupancy action. Not a pending-release transaction,
 * not simulation Reset, not Reset View.
 * docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md §8 / 41-2
 * Disabled when occupancy is empty: docs/ui/08-scene-toolbar-and-control-states.md
 */
export function ExploreClearTracersControl({
  tracerCount,
  onClear,
}: ExploreClearTracersControlProps) {
  const disabled = tracerCount === 0;
  return (
    <button
      type="button"
      className="ui-button tracer-runtime-controls__button"
      aria-label="Clear released tracers"
      disabled={disabled}
      title={
        disabled
          ? CLEAR_TRACERS_EMPTY_REASON
          : "Clear released tracers (not simulation Reset or Reset View)"
      }
      onClick={() => requestClearTracers(tracerCount, onClear)}
    >
      Clear tracers
    </button>
  );
}
