/**
 * Shared How It Works copy. Operator's guide, not physics derivation.
 * docs/ui/12-how-it-works-and-onboarding.md
 */

export type HowItWorksContext = "landing" | "guided" | "explore";

export const HOW_IT_WORKS_TITLE = "How It Works";

export const HOW_IT_WORKS_WHAT =
  "Supercell Explorer is an interactive laboratory for examining prescribed supercell airflow and watching passive tracers move through it.";

export const HOW_IT_WORKS_NOT_FORECAST =
  "The airflow is prescribed by the current environment. You explore that model; this is not live weather and not a forecast.";

export const HOW_IT_WORKS_GUIDED =
  "Follow prepared experiments designed to highlight particular storm structures and relationships.";

export const HOW_IT_WORKS_EXPLORE =
  "Choose an environment, release tracers yourself, and compare how they move through different atmospheric setups.";

export const HOW_IT_WORKS_NOT_SIMPLIFIED =
  "Guided and Explore are two different ways to investigate the laboratory. Guided is not a simplified Explore.";

export const HOW_IT_WORKS_ENVIRONMENT_NOT_MODE =
  "Environment is chosen inside a mode. It is not a third mode.";

export const HOW_IT_WORKS_AIRFLOW_MARKS =
  "They are visualization marks, not particles of air being permanently tracked.";

export const HOW_IT_WORKS_FLOW_COMETS =
  "Flow comets visualize the prescribed velocity field with short moving marks. Tails are direction cues, not tracer histories.";

export const HOW_IT_WORKS_EULERIAN =
  "Eulerian — diagnostic samples the same total velocity at fixed laboratory positions and shows instantaneous direction, not moving parcels.";

export const HOW_IT_WORKS_GRID =
  "E marks east and N marks north. The grid follows world coordinates. The HUD shows ground coordinates under the cursor.";

export const HOW_IT_WORKS_SCENE_CONTROLS =
  "Grid, Airflow view, Highlight, and Depth cue change how the scene is drawn. They do not change the atmospheric environment.";

export const HOW_IT_WORKS_HODOGRAPH =
  "The hodograph shows how the environmental wind vector changes with height.";

export const HOW_IT_WORKS_HODOGRAPH_POINTS =
  "Each point is the horizontal wind at a height. Together those points form the hodograph. Overlays show diagnostic relationships.";

export const HOW_IT_WORKS_OVERLAYS =
  "Diagnostic vectors are analytical overlays, not additional airflows.";

export const HOW_IT_WORKS_HODOGRAPH_INTERACTION =
  "You can move and resize the panel, and zoom or pan the plot. Reset restores the original plot view.";

export const HOW_IT_WORKS_TRACER =
  "A tracer is a passive marker carried by the simulated airflow. It helps reveal where the flow takes material released from a chosen point.";

export const HOW_IT_WORKS_PASSIVE =
  "A tracer does not affect the airflow.";

export const HOW_IT_WORKS_EXPLORE_WORKFLOW =
  "Release tracer → choose a ground position → choose altitude → confirm release.";

export const HOW_IT_WORKS_GUIDED_RELEASES =
  "In Guided, tracer releases are set by the prepared experiment.";

export const HOW_IT_WORKS_TAIL =
  "The tail is recorded trajectory, not an airflow streamline.";

export const HOW_IT_WORKS_SPEED =
  "Speed changes how quickly the simulation is played, not the atmospheric velocity field itself.";

export const HOW_IT_WORKS_EXPERIMENT_HEADING = "Changes the experiment";

export const HOW_IT_WORKS_VISUALIZATION_HEADING = "Changes only what you see";
