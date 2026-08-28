import {
  STORM_OPERAND_HIGHLIGHT_KEYS,
  isStormOperandHighlightKey,
} from "../../visualization/operandContributionDisplay.js";
import type {
  OperandHighlightMode,
  VisualAirflowWorkbenchMode,
} from "../../rendering/visualAirflowWorkbenchMode.js";
import { labelForContribution } from "./tracerContributionLabels.js";

export interface VisualAirflowWorkbenchControlsProps {
  mode: VisualAirflowWorkbenchMode;
  highlightMode: OperandHighlightMode;
  depthCueEnabled: boolean;
  onModeChange: (mode: VisualAirflowWorkbenchMode) => void;
  onHighlightModeChange: (value: OperandHighlightMode) => void;
  onDepthCueChange: (enabled: boolean) => void;
}

const FLOW_COMETS_COPY =
  "Airflow marks show motion and direction in the prescribed total velocity field, V_total. Short tails are direction cues, not tracer histories; marker count and spacing are not air density.";

const EULERIAN_DIRECTIONS_COPY =
  "Eulerian direction marks sample the prescribed total velocity field, V_total, at fixed laboratory positions. They show instantaneous direction, not moving air parcels; marker count and spacing are not air density.";

const HIGHLIGHT_COPY =
  "Highlight tints where one selected storm operand contributes to the displayed samples. Comet advection and every mark's orientation still come from the total field. Tint is not a separate air mass or a quantitative comparison between operands.";

const DEPTH_CUE_COPY =
  "Depth cue changes background airflow salience with camera distance. It is a viewing aid, not meteorological fog or an atmospheric quantity.";

const FLOW_COMETS_LINE =
  "V_total direction cues — tails ≠ history; spacing ≠ density.";

const EULERIAN_DIRECTIONS_LINE =
  "Fixed-position V_total samples — not parcels; spacing ≠ density.";

const HIGHLIGHT_LINE =
  "Tint shows one storm operand’s contribution — not a separate air mass.";

const DEPTH_CUE_LINE = "Viewing aid only — not meteorological fog.";

/**
 * Explore V1 airflow product controls. Comets are the default view;
 * Eulerian directions remain a diagnostic alternative.
 * Slice B: compact chrome; full anti-claims remain on-demand.
 * docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
 */
export function VisualAirflowWorkbenchControls({
  mode,
  highlightMode,
  depthCueEnabled,
  onModeChange,
  onHighlightModeChange,
  onDepthCueChange,
}: VisualAirflowWorkbenchControlsProps) {
  const airflowViewCopy =
    mode === "eulerian-oriented" ? EULERIAN_DIRECTIONS_COPY : FLOW_COMETS_COPY;
  const airflowViewLine =
    mode === "eulerian-oriented" ? EULERIAN_DIRECTIONS_LINE : FLOW_COMETS_LINE;

  return (
    <div className="visual-airflow-workbench-controls">
      <div className="visual-airflow-workbench-controls__group">
        <span className="visual-airflow-workbench-controls__label">
          Airflow view
        </span>
        <div className="visual-airflow-workbench-controls__row">
          <button
            type="button"
            className="ui-button ui-button--toggle tracer-runtime-controls__button"
            aria-pressed={mode === "advected-comet"}
            title={FLOW_COMETS_COPY}
            onClick={() => onModeChange("advected-comet")}
          >
            Flow comets
          </button>
          <button
            type="button"
            className="ui-button ui-button--toggle tracer-runtime-controls__button"
            aria-pressed={mode === "eulerian-oriented"}
            title={EULERIAN_DIRECTIONS_COPY}
            onClick={() => onModeChange("eulerian-oriented")}
          >
            Eulerian — diagnostic
          </button>
        </div>
        <p className="visual-airflow-workbench-controls__copy visual-airflow-workbench-controls__copy--compact">
          {airflowViewLine}
        </p>
        <details className="visual-airflow-workbench-controls__details">
          <summary>About airflow view</summary>
          <p className="visual-airflow-workbench-controls__copy">
            {airflowViewCopy}
          </p>
        </details>
      </div>

      <div className="visual-airflow-workbench-controls__group visual-airflow-workbench-controls__group--diagnostic">
        <span className="visual-airflow-workbench-controls__label">
          Diagnostic tools
        </span>
        <div className="visual-airflow-workbench-controls__row">
          <span className="visual-airflow-workbench-controls__label">
            Highlight
          </span>
          <button
            type="button"
            className="ui-button ui-button--toggle tracer-runtime-controls__button"
            aria-pressed={highlightMode === "off"}
            title={HIGHLIGHT_COPY}
            onClick={() => onHighlightModeChange("off")}
          >
            Off
          </button>
          <label className="visual-airflow-workbench-controls__field">
            Operand
            <select
              className="ui-select visual-airflow-workbench-controls__select"
              aria-label="Highlighted storm operand"
              title={HIGHLIGHT_COPY}
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
          <label
            className="visual-airflow-workbench-controls__field"
            title={DEPTH_CUE_COPY}
          >
            <input
              className="ui-check"
              type="checkbox"
              checked={depthCueEnabled}
              onChange={(event) =>
                onDepthCueChange(event.currentTarget.checked)
              }
            />
            Depth cue
          </label>
        </div>
        <p className="visual-airflow-workbench-controls__copy visual-airflow-workbench-controls__copy--compact">
          {HIGHLIGHT_LINE} {DEPTH_CUE_LINE}
        </p>
        <details className="visual-airflow-workbench-controls__details">
          <summary>About diagnostic tools</summary>
          <p className="visual-airflow-workbench-controls__copy">
            {HIGHLIGHT_COPY}
          </p>
          <p className="visual-airflow-workbench-controls__copy">
            {DEPTH_CUE_COPY}
          </p>
        </details>
      </div>
    </div>
  );
}
