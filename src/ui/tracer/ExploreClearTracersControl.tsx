export interface ExploreClearTracersControlProps {
  onClear: () => void;
}

/**
 * Explore occupancy action. Not a pending-release transaction,
 * not simulation Reset, not Reset View.
 * docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md §8 / 41-2
 */
export function ExploreClearTracersControl({
  onClear,
}: ExploreClearTracersControlProps) {
  return (
    <button
      type="button"
      className="tracer-runtime-controls__button"
      aria-label="Clear released tracers"
      title="Clear released tracers (not simulation Reset or Reset View)"
      onClick={onClear}
    >
      Clear tracers
    </button>
  );
}
