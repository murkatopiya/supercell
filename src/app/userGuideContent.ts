import { T1_EXPLANATION, ANALYSIS_FULL_COPY, ANALYSIS_BOUNDARY_COPY } from "./publicDiagnosticCopy.js";
import {
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
} from "../explore/exploreEnvironmentIdentity.js";
import { DEFAULT_EXPLORE_POINT_ALTITUDE_M } from "../explore/ExplorePointReleaseTool.js";
import { ANALYSIS_T1_COLOR_LEGEND_V1 } from "../ui/tracer/analysisT1ColorLegendV1.js";
import { ANALYSIS_MECHANISM_GLYPH_KEY_V1 } from "../ui/tracer/analysisMechanismGlyphKeyV1.js";
import { HOW_IT_WORKS_T1_SATURATION_DISPLAY } from "./howItWorksContent.js";

/**
 * Public User Guide copy. Practical Explore operator manual.
 * Not How It Works (conceptual model), not Glossary (terms).
 * docs/ui/16-user-guide.md
 */

export const USER_GUIDE_TITLE = "User Guide";

export const USER_GUIDE_INTRO =
  "A short practical manual for the Explore laboratory. It names the controls you can actually press.";

export const USER_GUIDE_INTRO_SIBLINGS =
  "How It Works explains the conceptual model. Glossary defines terms. Data attribution lives in Glossary and on the landing footer.";

export const USER_GUIDE_EXPLORE_SCOPE =
  "This manual describes Explore, the public laboratory. Guided uses prepared releases rather than free placement.";

export const USER_GUIDE_NAV = [
  { id: "user-guide-start", label: "Getting started" },
  { id: "user-guide-release", label: "Releasing tracers" },
  { id: "user-guide-run", label: "Running" },
  { id: "user-guide-view", label: "3D view" },
  { id: "user-guide-select", label: "Selecting" },
  { id: "user-guide-history", label: "Trajectory history" },
  { id: "user-guide-t1", label: "Analysis T1" },
  { id: "user-guide-glyph", label: "Mechanism glyph" },
  { id: "user-guide-verify", label: "T1 calculation" },
  { id: "user-guide-unavailable", label: "Unavailable" },
  { id: "user-guide-reset", label: "Reset" },
  { id: "user-guide-more", label: "Learn more" },
] as const;

export const USER_GUIDE_GOSHEN_LABEL = GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL;

export const USER_GUIDE_MOORE_LABEL = MOORE_2013_OBSERVED_ENVIRONMENT_LABEL;

export const USER_GUIDE_DEFAULT_ALTITUDE_M = DEFAULT_EXPLORE_POINT_ALTITUDE_M;

export const USER_GUIDE_START_OPEN =
  "From landing, Open Laboratory enters Explore. No laboratory is running until you do that.";

export const USER_GUIDE_START_ENVIRONMENT = `Under Storm-relative laboratory, use Environment. Explore starts on ${USER_GUIDE_GOSHEN_LABEL} — a good first choice, because it has both a Source profile that carries the tracer and an Analysis representation that can color the recorded path.`;

export const USER_GUIDE_START_OTHER_ENVIRONMENTS =
  "Other environments remain selectable. Source always advects the tracer. Analysis explanation is not identical for every environment.";

export const USER_GUIDE_START_WORKSPACE =
  "Left: Environment, Release, Runtime, and View. Center: the 3D scene. Right: Inspector and Analysis panels. Header: Hodograph plus this help.";

export const USER_GUIDE_RELEASE_FLOW = `Release tracer → click the ground → set Altitude (default ${USER_GUIDE_DEFAULT_ALTITUDE_M} m) → Confirm.`;

export const USER_GUIDE_RELEASE_PLACEMENT =
  "Release tracer arms placement mode. A stationary click on the ground sets the pending point. Dragging still orbits the camera, so a short click is the placement gesture.";

export const USER_GUIDE_RELEASE_NO_ADD =
  "Confirm releases the tracer. Placement stays enabled for additional releases; Cancel leaves placement mode. Let the tracer travel, pause, then click a recorded trajectory point to inspect T1 when Analysis is available.";

export const USER_GUIDE_CONTROLS = [
  {
    name: "Release tracer",
    meaning: "Enter placement mode. Click the ground, then Confirm.",
  },
  {
    name: "Confirm",
    meaning: "Release the pending tracer. Disabled until a ground point is placed.",
  },
  {
    name: "Cancel",
    meaning: "Leave placement mode without releasing. Clears a pending point if one exists.",
  },
  {
    name: "Undo / Redo",
    meaning: "Last tracer release only. Not a time rewind and not simulation Reset.",
  },
  {
    name: "Clear tracers",
    meaning: "Remove every released tracer. The clock keeps running. Not Reset, not Reset View.",
  },
  {
    name: "Reset",
    meaning: "Restart the simulation from the current seeds. Time returns to 0. Camera stays.",
  },
  {
    name: "Reset View",
    meaning: "Restore the storm camera. Does not reset the simulation or clear tracers.",
  },
] as const;

export const USER_GUIDE_RUN_PLAYBACK =
  "Pause stops advancement. Resume continues without catching up elapsed wall time. The button reads Pause while running and Resume while paused.";

export const USER_GUIDE_RUN_SPEED =
  "Speed (1×, 5×, 10×, 20×) changes how quickly the laboratory is played. It does not change the atmospheric velocity field. The session default is 5×.";

export const USER_GUIDE_RUN_TRAIL =
  "As the tracer moves, its occupancy trail records the path. That tail is recorded trajectory, not an airflow streamline.";

export const USER_GUIDE_VIEW_ORBIT =
  "Left-drag orbits. Right-drag pans. Scroll zooms. Reset View recovers the storm framing if the camera gets lost.";

export const USER_GUIDE_VIEW_GRID =
  "Grid on the viewport toggles the world coordinate reference (X east, Y up, Z south). It is a drawing aid, not a change of environment.";

export const USER_GUIDE_VIEW_HODOGRAPH =
  "Hodograph in the header opens the ground-relative wind plot. In Explore it starts closed. Pan, zoom, and Reset inside that panel change only the hodograph view.";

export const USER_GUIDE_VIEW_FOLLOW =
  "Follow keeps the camera on the selected live tracer. It needs a current selection and tracks the moving glyph, not a historical sample.";

export const USER_GUIDE_VIEW_FOCUS =
  "Focus sample aims the camera at the selected recorded path sample. One-shot framing; it is not Follow.";

export const USER_GUIDE_VIEW_AIRFLOW =
  "Airflow view, Highlight, and Depth cue change how the scene is drawn. They do not change the atmospheric environment.";

export const USER_GUIDE_SELECT_HOW =
  "Click the live tracer glyph. A selection halo appears; occupancy color stays the tracer's identity color.";

export const USER_GUIDE_SELECT_INSPECTOR =
  "Inspector opens on CURRENT: tracer id, position, altitude, simulation time, V_total, and Why this motion? — the prescribed velocity contributions at that marker.";

export const USER_GUIDE_HISTORY_LEAD =
  "Click the recorded trail itself — not the moving glyph — to select an exact historical sample.";

export const USER_GUIDE_HISTORY_CURRENT =
  "Current selection is the live tracer. Inspector says CURRENT and follows that tracer as the simulation advances.";

export const USER_GUIDE_HISTORY_SAMPLE =
  "A historical sample is one exact recorded (position, time) on that path, not an interpolated click. Inspector says HISTORICAL PATH SAMPLE. Diagnostics are recomputed at that marker. The live tracer is not rewound.";

export const USER_GUIDE_HISTORY_FOLLOW =
  "Follow still tracks the live glyph. Path pick does not replace the Follow target.";

export const USER_GUIDE_T1_WHAT =
  `${T1_EXPLANATION} When Analysis is available, supported parts of the recorded path get an Analysis T1 overlay. Tracer color is a different channel: tracer red is not positive T1.`;

export const USER_GUIDE_T1_COLOR =
  "Cool colors are negative T1. Near-neutral is near zero. Warm colors are positive T1.";

export const USER_GUIDE_T1_SCALE = `The legend uses a fixed symmetric scale. It saturates at ${HOW_IT_WORKS_T1_SATURATION_DISPLAY}. Values beyond that display limit keep their raw numeric value but use the saturated endpoint color.`;

export const USER_GUIDE_T1_GAPS =
  "Unsupported or out-of-domain stretches leave a gap in the Analysis overlay. The occupancy trail remains visible there. A gap is not zero T1.";

export const USER_GUIDE_T1_NOT_SPIN =
  "Analysis T1 is a reduced-field vertical-tilting diagnostic. The color is not parcel spin-up, not current parcel vorticity, and not Δω_y.";

export const USER_GUIDE_T1_LEGEND = ANALYSIS_T1_COLOR_LEGEND_V1;

export const USER_GUIDE_GLYPH_WHEN =
  "The mechanism glyph appears only for a supported historical sample. Current selection of the live tracer is not enough.";

export const USER_GUIDE_GLYPH_CYAN = ANALYSIS_MECHANISM_GLYPH_KEY_V1.omegaLabel;

export const USER_GUIDE_GLYPH_YELLOW =
  ANALYSIS_MECHANISM_GLYPH_KEY_V1.actualGradientLabel;

export const USER_GUIDE_GLYPH_DASHED =
  ANALYSIS_MECHANISM_GLYPH_KEY_V1.hypotheticalGradientLabel;

export const USER_GUIDE_GLYPH_MEANING =
  "The cyan arrow is environmental ω_h (held fixed). The solid yellow arrow is the actual prescribed ∇_h V_y. The dashed yellow arrow is a hypothetical copy of that gradient used by What-if geometry.";

export const USER_GUIDE_GLYPH_ARTISTIC =
  "Those colors are a visual key, not a scientific RGB encoding of magnitude.";

export const USER_GUIDE_VERIFY_WHERE =
  "T1 calculation, on the right, shows the two factors and their alignment used for the diagnostic: T1, |ω_h|, |∇_h V_y|, and θ. For a recorded trajectory point, this and What-if geometry appear before the motion details.";

export const USER_GUIDE_WHAT_IF_DOES =
  "The θ slider in What-if geometry rotates only a hypothetical copy of the prescribed gradient. Actual T1 and Hypothetical T1 are shown side by side. Reset to actual angle restores the actual laboratory alignment.";

export const USER_GUIDE_WHAT_IF_DOES_NOT =
  "The slider does not change the observed atmosphere, does not rewrite Source or Analysis, does not move the tracer, and does not restart the simulation.";

export const USER_GUIDE_UNAVAILABLE_LEAD =
  "A missing diagnostic is unavailable, not zero. Exact support codes are preserved in Technical details.";

export const USER_GUIDE_SUPPORT = [
  {
    code: "FULL_SUPPORT",
    meaning: ANALYSIS_FULL_COPY,
  },
  {
    code: "BOUNDARY_CONDITIONED",
    meaning:
      ANALYSIS_BOUNDARY_COPY,
  },
  {
    code: "OUT_OF_DOMAIN",
    meaning:
      "The sample is outside the supported Analysis domain. Unavailable, not treated as zero.",
  },
  {
    code: "COLUMN_UNAVAILABLE",
    meaning:
      "This environment does not include an Analysis representation. Source still advects. Analysis T1, the mechanism glyph, and what-if stay unavailable. This is not a broken Source environment and not a Source fallback.",
  },
] as const;

export const USER_GUIDE_UNAVAILABLE_MOORE = `${USER_GUIDE_MOORE_LABEL} is one current example of COLUMN_UNAVAILABLE: the Source profile still carries tracers, and Analysis T1 is unavailable. Other environments can share that pattern.`;

export const USER_GUIDE_RESET_SIMULATION =
  "Reset returns tracers to their seeds and simulation time to 0. Selection can remain; the historical sample probe is cleared.";

export const USER_GUIDE_RESET_CLEAR =
  "Clear tracers empties occupancy while the clock continues. Use it to start a new seeding without resetting time.";

export const USER_GUIDE_RESET_ENVIRONMENT =
  "Changing Environment builds a new laboratory atmosphere for that identity. It is the clean way to switch cases.";

export const USER_GUIDE_RESET_LANDING =
  "Supercell in the header returns to landing. The live laboratory is dismissed.";

export const USER_GUIDE_MORE_HOW_IT_WORKS =
  "How It Works — conceptual model: Source vs Analysis, what T1 is, scientific boundary.";

export const USER_GUIDE_MORE_GLOSSARY =
  "Glossary — short meanings for terms and quantities you can see, including support states.";

export const USER_GUIDE_MORE_ATTRIBUTION =
  "Data attribution — sounding-archive provenance in Glossary → Data, and in the landing footer. Event/case links are contextual and are not the sounding-data citation.";
