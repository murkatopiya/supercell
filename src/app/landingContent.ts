/**
 * Public Landing copy for v0.1. User-facing, not architecture lecture.
 */

export const LANDING_LEDE =
  "An interactive kinematic laboratory for exploring how environmental wind and prescribed storm-local flow geometry shape tracer trajectories and vertical-tilting diagnostics.";

export const LANDING_CTA_LABEL = "Open Laboratory";

export const LANDING_DISCLAIMER =
  "This is not a weather forecast or a full atmospheric simulation. It is a prescribed kinematic laboratory for examining selected mechanisms under controlled assumptions.";

export const LANDING_ENVIRONMENTS_NOTE =
  "Observed environments include Goshen, Prospect Valley, Dumas, and Moore. Analysis explanation along a trajectory is available only when a suitable Analysis representation exists.";

export const LANDING_GUIDED_LATER_NOTE =
  "A guided walkthrough is planned for a later version.";

export const LANDING_CAPABILITIES = [
  {
    title: "Explore observed environments",
    copy: "Use sounding-derived environmental wind profiles.",
  },
  {
    title: "Follow trajectories",
    copy: "Release passive tracers in a prescribed storm-relative flow.",
  },
  {
    title: "Read Analysis T1 along the path",
    copy: "See where the vertical-tilting diagnostic is positive or negative.",
  },
  {
    title: "Explain a historical sample",
    copy: "Inspect environmental horizontal vorticity, prescribed updraft-gradient geometry, numeric verification, and a constrained what-if alignment.",
  },
] as const;
