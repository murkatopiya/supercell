export interface ExplorePointReleaseControlsProps {
  altitudeM: number;
  placementEnabled: boolean;
  hasPending: boolean;
  onAltitudeChange: (altitudeM: number) => void;
  onPlacementEnabledChange: (enabled: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PENDING_REQUIRED_REASON =
  "Click the ground to place a release point first.";
const PLACEMENT_INSTRUCTION = PENDING_REQUIRED_REASON;

/**
 * Explore release controls. Slice 41-1: [Release tracer] arms the
 * existing placementEnabled pointer gate. Confirm/Cancel stay the
 * pending transaction. Occupancy emptying is not a release action (41-2).
 * docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
 */
export function ExplorePointReleaseControls({
  altitudeM,
  placementEnabled,
  hasPending,
  onAltitudeChange,
  onPlacementEnabledChange,
  onConfirm,
  onCancel,
}: ExplorePointReleaseControlsProps) {
  return (
    <div className="explore-point-release-controls">
      <p className="explore-point-release-controls__copy">
        Release passive tracers at a chosen altitude.
      </p>
      <div className="explore-point-release-controls__row">
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={placementEnabled}
          aria-label="Release tracer"
          title="Enter placement mode, then click the ground to choose a point"
          onClick={() => {
            if (!placementEnabled) {
              onPlacementEnabledChange(true);
            }
          }}
        >
          Release tracer
        </button>
        {placementEnabled ? (
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
        ) : null}
        {placementEnabled ? (
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
        ) : null}
        {placementEnabled ? (
          <button
            type="button"
            className="tracer-runtime-controls__button"
            aria-label="Cancel placement"
            title={
              hasPending
                ? "Clear pending point and leave placement mode"
                : "Leave placement mode"
            }
            onClick={onCancel}
          >
          Cancel
        </button>
        ) : null}
      </div>
      {placementEnabled && !hasPending ? (
        <p className="control-disabled-reason">{PLACEMENT_INSTRUCTION}</p>
      ) : null}
    </div>
  );
}
