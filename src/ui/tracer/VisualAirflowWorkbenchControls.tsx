import type {
  UpdraftHighlightMode,
  VisualAirflowPauseVisualization,
  VisualAirflowWorkbenchMode,
} from "../../rendering/visualAirflowWorkbenchMode.js";

export interface VisualAirflowWorkbenchControlsProps {
  mode: VisualAirflowWorkbenchMode;
  pauseVisualization: VisualAirflowPauseVisualization;
  highlightMode: UpdraftHighlightMode;
  depthCueEnabled: boolean;
  onModeChange: (mode: VisualAirflowWorkbenchMode) => void;
  onPauseVisualizationChange: (
    value: VisualAirflowPauseVisualization,
  ) => void;
  onHighlightModeChange: (value: UpdraftHighlightMode) => void;
  onDepthCueChange: (enabled: boolean) => void;
}

/**
 * Temporary Explore-only research control. Not product visualization
 * modes and not persisted.
 */
export function VisualAirflowWorkbenchControls({
  mode,
  pauseVisualization,
  highlightMode,
  depthCueEnabled,
  onModeChange,
  onPauseVisualizationChange,
  onHighlightModeChange,
  onDepthCueChange,
}: VisualAirflowWorkbenchControlsProps) {
  return (
    <div className="visual-airflow-workbench-controls">
      <p className="visual-airflow-workbench-controls__copy">
        Dev workbench — independent comparisons of the same V_total. Not
        product visualization modes. Encoding, Pause viz, and highlight do not
        change each other. Comet highlight tints R1/comet/Eulerian marks at
        their sample P,t; Points stay uniform. Background is sparse Eulerian
        points, not a volume.
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
          aria-pressed={mode === "advected-comet"}
          onClick={() => onModeChange("advected-comet")}
        >
          Comets
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={mode === "eulerian-oriented"}
          onClick={() => onModeChange("eulerian-oriented")}
        >
          Eulerian marks
        </button>
      </div>
      <div className="visual-airflow-workbench-controls__row">
        <span className="visual-airflow-workbench-controls__label">
          Pause viz
        </span>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={pauseVisualization === "full-freeze"}
          onClick={() => onPauseVisualizationChange("full-freeze")}
        >
          Full freeze
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={pauseVisualization === "frozen-field-animation"}
          onClick={() => onPauseVisualizationChange("frozen-field-animation")}
        >
          Animate frozen field
        </button>
      </div>
      <div className="visual-airflow-workbench-controls__row">
        <span className="visual-airflow-workbench-controls__label">
          Updraft highlight
        </span>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={highlightMode === "off"}
          onClick={() => onHighlightModeChange("off")}
        >
          Off
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={highlightMode === "background"}
          onClick={() => onHighlightModeChange("background")}
        >
          Background
        </button>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={highlightMode === "comets"}
          onClick={() => onHighlightModeChange("comets")}
        >
          Comets
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
