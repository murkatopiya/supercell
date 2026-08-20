export interface ExploreResetViewControlProps {
  onResetView: () => void;
}

/**
 * Explore-only Reset View button. Camera recovery, not simulation Reset.
 * docs/architecture/37-reset-view-camera-recovery-architecture.md
 * Terminology: docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md F7
 */
export function ExploreResetViewControl({
  onResetView,
}: ExploreResetViewControlProps) {
  return (
    <div className="tracer-runtime-controls">
      <div className="tracer-runtime-controls__group tracer-runtime-controls__group--runtime">
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-label="Reset camera to storm view"
          title="Reset camera to storm view (does not reset the simulation)"
          onClick={onResetView}
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
