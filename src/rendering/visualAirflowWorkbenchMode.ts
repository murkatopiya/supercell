import type { UpdraftHighlightPrototypeId } from "../visualization/operandContributionDisplay.js";

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
 * Live updraft highlight. Background is a rejected branch and is not
 * a mode. Non-off values tint R1 / comet / Eulerian marks (Highlight
 * Comets) with one prototype hue.
 */
export type UpdraftHighlightMode = "off" | UpdraftHighlightPrototypeId;

export const DEFAULT_UPDRAFT_HIGHLIGHT_MODE: UpdraftHighlightMode = "off";
