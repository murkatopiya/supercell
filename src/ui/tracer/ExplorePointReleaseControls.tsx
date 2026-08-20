export interface ExplorePointReleaseControlsProps {
  altitudeM: number;
  placementEnabled: boolean;
  hasPending: boolean;
  onAltitudeChange: (altitudeM: number) => void;
  onPlacementEnabledChange: (enabled: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onClear: () => void;
}

const PENDING_REQUIRED_REASON = "Click the ground to place a release point first.";

/**
 * Explore release controls. Compact Slice B action-rail surface.
 * docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
 */
export function ExplorePointReleaseControls({
  altitudeM,
  placementEnabled,
  hasPending,
  onAltitudeChange,
  onPlacementEnabledChange,
  onConfirm,
  onCancel,
  onClear,
}: ExplorePointReleaseControlsProps) {
  return (
    <div className="explore-point-release-controls">
      <p className="explore-point-release-controls__copy">
        Release passive tracers at a chosen altitude.
      </p>
      <div className="explore-point-release-controls__row">
        <label className="explore-point-release-controls__field">
          Altitude
          <input
            type="number"
            min={0}
            step={100}
            value={Number.isFinite(altitudeM) ? altitudeM : 0}
            onChange={(event) => {
              const next = event.target.valueAsNumber;
              if (!Number.isFinite(next) || next < 0) {
                return;
              }
              onAltitudeChange(next);
            }}
          />
          m
        </label>
        <label className="explore-point-release-controls__field">
          <input
            type="checkbox"
            checked={placementEnabled}
            onChange={(event) =>
              onPlacementEnabledChange(event.currentTarget.checked)
            }
          />
          Enable placement
        </label>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          disabled={!hasPending}
          title={!hasPending ? PENDING_REQUIRED_REASON : undefined}
          aria-label={
            hasPending
              ? "Confirm release"
              : `Confirm release — ${PENDING_REQUIRED_REASON}`
          }
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          disabled={!hasPending}
          title={!hasPending ? PENDING_REQUIRED_REASON : undefined}
          aria-label={
            hasPending
              ? "Cancel pending release"
              : `Cancel pending release — ${PENDING_REQUIRED_REASON}`
          }
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-label="Clear released tracers"
          title="Clear released tracers (not simulation Reset or Reset View)"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
      {!hasPending ? (
        <p className="control-disabled-reason">{PENDING_REQUIRED_REASON}</p>
      ) : null}
    </div>
  );
}
