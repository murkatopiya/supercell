export interface ExploreFocusSampleControlProps {
  canFocus: boolean;
  onFocusSample: () => void;
}

export const FOCUS_SAMPLE_REQUIRES_PROBE_REASON =
  "Select a recorded path sample.";

/**
 * Explore-only one-shot camera target at the selected historical sample.
 * Not Follow. Does not change selection, Simulation, or Analysis.
 */
export function ExploreFocusSampleControl({
  canFocus,
  onFocusSample,
}: ExploreFocusSampleControlProps) {
  return (
    <div className="tracer-runtime-controls">
      <div className="tracer-runtime-controls__group tracer-runtime-controls__group--runtime">
        <button
          type="button"
          className="ui-button tracer-runtime-controls__button"
          aria-label={
            canFocus
              ? "Focus camera on selected recorded sample"
              : `Focus camera on selected recorded sample — ${FOCUS_SAMPLE_REQUIRES_PROBE_REASON}`
          }
          disabled={!canFocus}
          title={!canFocus ? FOCUS_SAMPLE_REQUIRES_PROBE_REASON : undefined}
          onClick={() => {
            if (!canFocus) {
              return;
            }
            onFocusSample();
          }}
        >
          Focus sample
        </button>
        {!canFocus ? (
          <span className="control-disabled-reason">
            {FOCUS_SAMPLE_REQUIRES_PROBE_REASON}
          </span>
        ) : null}
      </div>
    </div>
  );
}
