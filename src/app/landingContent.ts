/**
 * Public Landing copy for the first release. User-facing, not architecture lecture.
 */

import {
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  type ExploreEnvironmentIdentity,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL,
  DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL,
  MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
} from "../explore/exploreEnvironmentIdentity.js";

export const LANDING_LEDE =
  "Investigate three-dimensional airflow through scientific data, calculated trajectories, and numerical experiments.";

export const LANDING_CTA_LABEL = "Explore";

export const LANDING_DISCLAIMER =
  "Supercell Explorer is an experimental kinematic laboratory, not a weather forecast or a full atmospheric simulation. Its airflow is prescribed, and results must be interpreted within the assumptions and validation limits of each experiment.";

export const LANDING_ENVIRONMENTS_LEAD = "Observed environments include";

export const LANDING_ENVIRONMENTS_ANALYSIS_NOTE =
  "Source uses retained observed winds; Analysis is separately filtered. Analysis explanation along a trajectory is available only when an Analysis representation exists. Storm-local airflow and storm motion remain prescribed.";

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
      label: GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
      eventContextUrl: "https://www.weather.gov/cys/GoshenCountyTornado",
      accessibleName: "Goshen 2009 case information (opens in a new tab)",
    },
    {
      identity: EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
      label: PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL,
      eventContextUrl:
        "https://journals.ametsoc.org/view/journals/mwre/148/5/mwr-d-19-0288.1.xml",
      accessibleName:
        "Prospect Valley 2010 case information (opens in a new tab)",
    },
    {
      identity: EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
      label: DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL,
      eventContextUrl: "https://www.weather.gov/media/ama/may2010.pdf",
      accessibleName: "Dumas 2010 case information (opens in a new tab)",
    },
    {
      identity: EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
      label: MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
      eventContextUrl: "https://www.weather.gov/oun/events-20130520",
      accessibleName: "Moore 2013 case information (opens in a new tab)",
    },
  ];

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
  { title: "Scientific data", copy: "Work with documented atmospheric environments and their source data, including observed wind profiles." },
  { title: "Motion & vectors", copy: "Examine three-dimensional passive tracer trajectories and velocity components. Analysis T1 is a project-specific, constrained vertical-tilting diagnostic using environmental horizontal vorticity and the horizontal gradient of prescribed updraft vertical velocity." },
  { title: "Controlled experiments", copy: "Investigate model behavior using explicit numerical methods, assumptions, and reproducible procedures." },
] as const;

export const LANDING_WHATS_NEXT_TITLE = "Research direction";

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
    copy: "Available today: observed wind profiles, prescribed storm-local airflow, tracer trajectories, and constrained Analysis T1.",
  },
  {
    id: "thermodynamics",
    kind: "next",
    status: "Next",
    topic: "Thermodynamics",
    copy: "Future research: atmospheric stability, parcel thermodynamics, buoyancy, convective available potential energy (CAPE) and convective inhibition (CIN). Not implemented.",
  },
  {
    id: "coupled",
    kind: "later",
    status: "Later",
    topic: "Coupled mechanisms & user-defined scenarios",
    copy: "Longer-term direction, not available today. Only where scientifically justified and actually implemented.",
  },
] as const;
