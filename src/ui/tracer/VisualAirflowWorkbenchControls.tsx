import type { VisualAirflowWorkbenchMode } from "../../rendering/visualAirflowWorkbenchMode.js";

export interface VisualAirflowWorkbenchControlsProps {
  mode: VisualAirflowWorkbenchMode;
  depthCueEnabled: boolean;
  onModeChange: (mode: VisualAirflowWorkbenchMode) => void;
  onDepthCueChange: (enabled: boolean) => void;
}

/**
 * Temporary Explore-only research control. Not product visualization
 * modes and not persisted.
 */
export function VisualAirflowWorkbenchControls({
  mode,
  depthCueEnabled,
  onModeChange,
  onDepthCueChange,
}: VisualAirflowWorkbenchControlsProps) {
  return (
    <div className="visual-airflow-workbench-controls">
      <p className="visual-airflow-workbench-controls__copy">
        Dev workbench — compare encodings of the same V_total. Not
        product visualization modes.
      </p>
      <div className="visual-airflow-workbench-controls__row">
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={mode === "points"}
          onClick={() => onModeChange("points")}
        >
          Points
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={mode === "advected-oriented"}
          onClick={() => onModeChange("advected-oriented")}
        >
          Advected marks
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={mode === "eulerian-oriented"}
          onClick={() => onModeChange("eulerian-oriented")}
        >
          Eulerian marks
        </button>
        <label className="visual-airflow-workbench-controls__field">
          <input
            type="checkbox"
            checked={depthCueEnabled}
            onChange={(event) => onDepthCueChange(event.currentTarget.checked)}
          />
          Depth cue
        </label>
      </div>
    </div>
  );
}
