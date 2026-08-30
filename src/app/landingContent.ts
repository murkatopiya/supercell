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

export const LANDING_WHY_EXISTS_TITLE = "Why this exists";

export const LANDING_WHY_EXISTS_LEAD =
  "Environmental wind profiles and hodographs describe the surrounding environment, but they do not by themselves show how a trajectory passes through prescribed storm-local flow geometry — or why the sampled vertical-tilting diagnostic changes along that path.";

export const LANDING_WHY_EXISTS_CONNECTS =
  "Supercell Explorer connects these views. Follow a passive tracer through the laboratory, see where Analysis T1 changes along its recorded trajectory, and inspect the vector geometry behind any supported historical sample.";

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

export const LANDING_DESKTOP_RECOMMENDED =
  "Desktop recommended for the full 3D laboratory experience.";

export const LANDING_FOOTER_PRODUCT = "Supercell Explorer";

export const LANDING_FOOTER_CREATED_BY = "Created by Iryna Hnatovska";

export const LANDING_FOOTER_PORTFOLIO_LABEL = "Portfolio";

export const LANDING_FOOTER_PORTFOLIO_URL = "https://iryna.online";

export const LANDING_FOOTER_PORTFOLIO_ACCESSIBLE_NAME =
  "Iryna Hnatovska portfolio (opens in a new tab)";

export const LANDING_FOOTER_PROJECT =
  "Independent research & software project · 2026";

export const LANDING_ATTRIBUTION_LABEL = "Data & attribution";

export const LANDING_ATTRIBUTION_ESC_CASES =
  "Goshen / Prospect Valley / Dumas";

export const LANDING_ATTRIBUTION_MOORE_CASE = "Moore";

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

export const LANDING_WHATS_NEXT_TITLE = "What's next";

export const LANDING_WHATS_NEXT_LEAD =
  "Supercell Explorer v1 focuses on kinematics: observed wind environments, prescribed storm-local flow geometry, tracer trajectories, and vertical-tilting diagnostics.";

export const LANDING_WHATS_NEXT_DIRECTION =
  "The next research direction is thermodynamics — extending the laboratory toward atmospheric stability, parcel thermodynamics, buoyancy, and the environments that support deep convection.";

export const LANDING_WHATS_NEXT_PRINCIPLE_LEAD =
  "Kinematics first. Thermodynamics next.";

export const LANDING_WHATS_NEXT_PRINCIPLE_CLOSE =
  "Coupling only when the physics earns it.";

export const LANDING_WHATS_NEXT_STAGES = [
  {
    id: "kinematics",
    kind: "current",
    status: "V1",
    topic: "Kinematics",
    items: [
      "Observed wind",
      "trajectories",
      "Analysis T1",
      "mechanism geometry",
    ],
  },
  {
    id: "thermodynamics",
    kind: "next",
    status: "Next",
    topic: "Thermodynamics",
    tokens: ["T", "Td", "p"],
    items: ["parcel ascent", "stability", "buoyancy", "CAPE / CIN"],
  },
  {
    id: "coupled",
    kind: "later",
    status: "Later",
    topic: "Coupled mechanisms",
    copy: "Only where a scientifically defensible coupling is established.",
  },
] as const;
