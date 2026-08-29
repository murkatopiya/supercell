import { T1_COLOR_SCALE_V1_SATURATION } from "../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import { formatPointDiagnosticScientific } from "../ui/tracer/formatPointDiagnosticDisplay.js";

/**
 * Shared How It Works copy. Operator's guide for the current Explore workflow.
 * docs/ui/12-how-it-works-and-onboarding.md
 */

export type HowItWorksContext = "landing" | "guided" | "explore";

export const HOW_IT_WORKS_TITLE = "How It Works";

export const HOW_IT_WORKS_T1_SATURATION_DISPLAY = `±${formatPointDiagnosticScientific(T1_COLOR_SCALE_V1_SATURATION)} s⁻²`;

export const HOW_IT_WORKS_WHAT =
  "Supercell Explorer is an interactive kinematic laboratory. You release passive tracers through a prescribed storm-relative flow and read a vertical-tilting diagnostic along the recorded path.";

export const HOW_IT_WORKS_NOT_FORECAST =
  "This is not live weather and not a forecast. The airflow is prescribed by the current laboratory environment.";

export const HOW_IT_WORKS_CHOOSE_ENVIRONMENT =
  "Use the Environment selector under Storm-relative laboratory to choose an observed environment. Where available, that environment is an observed sounding-derived Source profile used in the laboratory velocity and advection path.";

export const HOW_IT_WORKS_RELEASE_TRACER =
  "A tracer is a passive marker carried by the prescribed storm-relative laboratory velocity field. It does not affect the airflow.";

export const HOW_IT_WORKS_PASSIVE =
  "A tracer does not affect the airflow.";

export const HOW_IT_WORKS_EXPLORE_WORKFLOW =
  "Release tracer → choose a ground position → choose altitude → confirm release.";

export const HOW_IT_WORKS_GUIDED_RELEASES =
  "In this prepared exhibit, tracer releases are set by the experiment. The public laboratory workflow below describes Explore.";

export const HOW_IT_WORKS_RECORDED_TRAJECTORY =
  "When a suitable Analysis representation is available, supported parts of the recorded trajectory are colored by Analysis T1, a reduced-field vertical-tilting diagnostic, using a fixed symmetric scale.";

export const HOW_IT_WORKS_TAIL =
  "The tail is recorded trajectory, not an airflow streamline.";

export const HOW_IT_WORKS_COLOR =
  "Warm colors mean positive T1. Cool colors mean negative T1. Near-neutral color means near zero.";

export const HOW_IT_WORKS_COLOR_SCALE = `The color scale is fixed and symmetric. It saturates at ${HOW_IT_WORKS_T1_SATURATION_DISPLAY}. Values beyond that display limit keep their raw numeric value but use the saturated endpoint color. Out-of-support or unavailable samples are not mapped to zero.`;

export const HOW_IT_WORKS_HISTORICAL_SAMPLE =
  "Click a historical sample on the recorded path. Selection refers to that exact recorded trajectory sample.";

export const HOW_IT_WORKS_T1_GEOMETRY =
  "T1 is explained by the alignment between environmental horizontal vorticity ω_h and the prescribed updraft horizontal gradient ∇_h V_y.";

export const HOW_IT_WORKS_T1_EQUATION = "T1 = ω_h,env · ∇_h V_y,updraft";

export const HOW_IT_WORKS_T1_EQUATION_COS = "T1 = |ω_h| |∇_h V_y| cos θ";

export const HOW_IT_WORKS_VERIFY =
  "The inspector shows the same atomic Analysis result used for the geometric explanation.";

export const HOW_IT_WORKS_WHAT_IF =
  "What-if geometry keeps the observed environmental ω_h fixed. Only a hypothetical copy of the prescribed storm-local gradient alignment varies. Laboratory state remains unchanged.";

export const HOW_IT_WORKS_SOURCE =
  "The Source environment is used in the laboratory velocity and advection path. Source advects the tracer.";

export const HOW_IT_WORKS_ANALYSIS =
  "The Analysis representation is used to explain selected diagnostics along the recorded trajectory when an Analysis sibling is available. Analysis explains those diagnostics; it does not push the tracer.";

export const HOW_IT_WORKS_SOURCE_ADVECTS_ANALYSIS_EXPLAINS =
  "Source advects. Analysis explains.";

export const HOW_IT_WORKS_ANALYSIS_UNAVAILABLE =
  "Analysis capability may be unavailable when no suitable Analysis representation exists for the selected environment.";

export const HOW_IT_WORKS_BOUNDARY =
  "This is a prescribed kinematic storm-relative laboratory. It is not a weather forecast, not LES or CFD, not a prognostic parcel-vorticity model, and not a reconstructed storm evolution.";

export const HOW_IT_WORKS_SPEED =
  "Speed changes how quickly the simulation is played, not the atmospheric velocity field itself.";

export const HOW_IT_WORKS_SCENE_CONTROLS =
  "Grid, Airflow view, Highlight, and Depth cue change how the scene is drawn. They do not change the atmospheric environment.";
