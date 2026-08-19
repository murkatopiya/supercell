import {
  STORM_OPERAND_HIGHLIGHT_KEYS,
  isStormOperandHighlightKey,
} from "../../visualization/operandContributionDisplay.js";
import type {
  OperandHighlightMode,
  VisualAirflowPauseVisualization,
  VisualAirflowWorkbenchMode,
} from "../../rendering/visualAirflowWorkbenchMode.js";
import { labelForContribution } from "./tracerContributionLabels.js";

export interface VisualAirflowWorkbenchControlsProps {
  mode: VisualAirflowWorkbenchMode;
  pauseVisualization: VisualAirflowPauseVisualization;
  highlightMode: OperandHighlightMode;
  depthCueEnabled: boolean;
  onModeChange: (mode: VisualAirflowWorkbenchMode) => void;
  onPauseVisualizationChange: (
    value: VisualAirflowPauseVisualization,
  ) => void;
  onHighlightModeChange: (value: OperandHighlightMode) => void;
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
        change each other. Use Comets (or Advected / Eulerian marks), then Off
        or one storm operand. Comets still follow V_total; tint is only that
        operand&apos;s |V| at P,t. Color is not a separate air mass and not a
        quantitative comparison across operands. Points stay uniform. One
        prototype hue, not a product palette.
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
          Highlight
        </span>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-pressed={highlightMode === "off"}
          onClick={() => onHighlightModeChange("off")}
        >
          Off
        </button>
        <label className="visual-airflow-workbench-controls__field">
          Operand
          <select
            className="visual-airflow-workbench-controls__select"
            aria-label="Highlighted storm operand"
            value={highlightMode === "off" ? "" : highlightMode}
            onChange={(event) => {
              const next = event.target.value;
              if (isStormOperandHighlightKey(next)) {
                onHighlightModeChange(next);
              }
            }}
          >
            {highlightMode === "off" ? (
              <option value="" disabled>
                Choose
              </option>
            ) : null}
            {STORM_OPERAND_HIGHLIGHT_KEYS.map((key) => (
              <option key={key} value={key}>
                {labelForContribution(key)}
              </option>
            ))}
          </select>
        </label>
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
