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

/**
 * Compact Slice 4 Explore controls. Not the final product panel.
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
        Release passive tracers into the current storm-relative laboratory.
      </p>
      <div className="explore-point-release-controls__row">
        <label className="explore-point-release-controls__field">
          altitude (m)
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
        </label>
        <label className="explore-point-release-controls__field">
          <input
            type="checkbox"
            checked={placementEnabled}
            onChange={(event) =>
              onPlacementEnabledChange(event.target.checked)
            }
          />
          enable placement
        </label>
      </div>
      <div className="explore-point-release-controls__row">
        <button
          type="button"
          className="tracer-runtime-controls__button"
          disabled={!hasPending}
          onClick={onConfirm}
        >
          Confirm release
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          disabled={!hasPending}
          onClick={onCancel}
        >
          Cancel pending
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
