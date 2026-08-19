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

export type UpdraftHighlightMode = "off" | "background" | "comets";

export const DEFAULT_UPDRAFT_HIGHLIGHT_MODE: UpdraftHighlightMode = "off";
