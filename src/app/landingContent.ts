/**
 * Public Landing copy for v0.1. User-facing, not architecture lecture.
 */

import {
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  type ExploreEnvironmentIdentity,
} from "../explore/exploreEnvironmentIdentity.js";

export const LANDING_LEDE =
  "An interactive kinematic laboratory for exploring how environmental wind and prescribed storm-local flow geometry shape tracer trajectories and vertical-tilting diagnostics.";

export const LANDING_CTA_LABEL = "Open Laboratory";

export const LANDING_DISCLAIMER =
  "This is not a weather forecast or a full atmospheric simulation. It is a prescribed kinematic laboratory for examining selected mechanisms under controlled assumptions.";

export const LANDING_ENVIRONMENTS_LEAD = "Observed environments include";

export const LANDING_ENVIRONMENTS_ANALYSIS_NOTE =
  "Analysis explanation along a trajectory is available only when a suitable Analysis representation exists.";

export interface LandingObservedEnvironmentLink {
  readonly identity: ExploreEnvironmentIdentity;
  readonly label: string;
  readonly eventContextUrl: string;
  readonly accessibleName: string;
}

/**
 * Public event/case context only. Not laboratory reconstruction,
 * advection input, or Analysis availability.
 */
export const LANDING_OBSERVED_ENVIRONMENT_LINKS: readonly LandingObservedEnvironmentLink[] =
  [
    {
      identity: EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
      label: "Goshen",
      eventContextUrl: "https://www.weather.gov/cys/GoshenCountyTornado",
      accessibleName: "Goshen 2009 case information (opens in a new tab)",
    },
    {
      identity: EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
      label: "Prospect Valley",
      eventContextUrl:
        "https://journals.ametsoc.org/view/journals/mwre/148/5/mwr-d-19-0288.1.xml",
      accessibleName:
        "Prospect Valley 2010 case information (opens in a new tab)",
    },
    {
      identity: EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
      label: "Dumas",
      eventContextUrl: "https://www.weather.gov/media/ama/may2010.pdf",
      accessibleName: "Dumas 2010 case information (opens in a new tab)",
    },
    {
      identity: EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
      label: "Moore",
      eventContextUrl: "https://www.weather.gov/oun/events-20130520",
      accessibleName: "Moore 2013 case information (opens in a new tab)",
    },
  ];

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
