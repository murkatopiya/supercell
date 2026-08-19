import {
  UPDRAFT_HIGHLIGHT_PROTOTYPE_HUES,
  type UpdraftHighlightPrototypeId,
} from "../../visualization/operandContributionDisplay.js";
import type {
  UpdraftHighlightMode,
  VisualAirflowPauseVisualization,
  VisualAirflowWorkbenchMode,
} from "../../rendering/visualAirflowWorkbenchMode.js";

const PROTOTYPE_HUE_BUTTONS: ReadonlyArray<{
  mode: UpdraftHighlightPrototypeId;
  label: string;
}> = [
  { mode: "hue-a", label: "Hue A" },
  { mode: "hue-b", label: "Hue B" },
  { mode: "hue-c", label: "Hue C" },
];

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
        change each other. Use Comets (or Advected / Eulerian marks), then Off
        → Hue A → Hue B → Hue C. Hues tint those marks from updraft |V| at
        sample P,t. Points stay uniform. Prototype hues, not a product palette.
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
        {PROTOTYPE_HUE_BUTTONS.map(({ mode: hueMode, label }) => (
          <button
            key={hueMode}
            type="button"
            className="tracer-runtime-controls__button"
            aria-pressed={highlightMode === hueMode}
            onClick={() => onHighlightModeChange(hueMode)}
          >
            <span
              className="visual-airflow-workbench-controls__hue-chip"
              style={{
                backgroundColor: cssHex(UPDRAFT_HIGHLIGHT_PROTOTYPE_HUES[hueMode]),
              }}
              aria-hidden="true"
            />
            {label}
          </button>
        ))}
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

function cssHex(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}
