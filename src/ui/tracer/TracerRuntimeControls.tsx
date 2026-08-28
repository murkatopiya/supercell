export const TRACER_TIME_SCALES = [1, 5, 10, 20] as const;

export type TracerTimeScale = (typeof TRACER_TIME_SCALES)[number];

/** UI/runtime session default. Not a physics constant. */
export const DEFAULT_TRACER_TIME_SCALE: TracerTimeScale = 5;

export interface TracerRuntimeControlsProps {
  paused: boolean;
  timeScale: TracerTimeScale;
  onPausedChange: (paused: boolean) => void;
  onTimeScaleChange: (timeScale: TracerTimeScale) => void;
  onReset: () => void;
}

/**
 * Shared Pause / simulation Reset / Speed.
 * Terminology: Reset = simulation, not camera (40 F7).
 */
export function TracerRuntimeControls({
  paused,
  timeScale,
  onPausedChange,
  onTimeScaleChange,
  onReset,
}: TracerRuntimeControlsProps) {
  return (
    <div className="tracer-runtime-controls">
      <div className="tracer-runtime-controls__group tracer-runtime-controls__group--runtime">
        <button
          type="button"
          className="ui-button tracer-runtime-controls__button"
          onClick={() => onPausedChange(!paused)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          className="ui-button tracer-runtime-controls__button"
          aria-label="Reset simulation"
          title="Reset simulation (not camera)"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <fieldset className="tracer-runtime-controls__scales">
        <legend className="tracer-runtime-controls__legend">
          <span>Speed</span>
        </legend>
        {TRACER_TIME_SCALES.map((scale) => (
          <label key={scale} className="tracer-runtime-controls__scale">
            <input
              className="ui-check"
              type="radio"
              name="tracer-time-scale"
              checked={timeScale === scale}
              onChange={() => onTimeScaleChange(scale)}
            />
            {scale}×
          </label>
        ))}
      </fieldset>
    </div>
  );
}
