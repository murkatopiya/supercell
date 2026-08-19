import type { StormOperandHighlightKey } from "../visualization/operandContributionDisplay.js";

export type VisualAirflowWorkbenchMode =
  | "points"
  | "advected-oriented"
  | "advected-comet"
  | "eulerian-oriented";

export const DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE: VisualAirflowWorkbenchMode =
  "points";

export type VisualAirflowPauseVisualization =
  | "full-freeze"
  | "frozen-field-animation";

export const DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION: VisualAirflowPauseVisualization =
  "full-freeze";

/**
 * Live operand highlight. Background is a rejected branch and is not
 * a mode. Non-off values tint R1 / comet / Eulerian marks from the
 * selected storm operand with one prototype hue.
 */
export type OperandHighlightMode = "off" | StormOperandHighlightKey;

export const DEFAULT_OPERAND_HIGHLIGHT_MODE: OperandHighlightMode = "off";
