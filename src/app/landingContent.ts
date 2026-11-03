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
  "An interactive 3D laboratory for exploring airflow inside a model of a supercell thunderstorm.";

export const LANDING_CTA_LABEL = "Explore";

export const LANDING_DISCLAIMER =
  "Supercell Explorer is an experimental kinematic laboratory, not a weather forecast or a full atmospheric simulation. Its airflow is prescribed, and results must be interpreted within the assumptions and validation limits of each experiment.";

export const LANDING_ENVIRONMENTS_LEAD = "Observed environments include selected severe-storm cases in the United States:";

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
  { title: "Inspect local motion", copy: "Select a tracer or a point along its recorded path in Explore to inspect position, time, velocity components, and speed." },
  { title: "Understand prescribed velocity contributions", copy: "Use “Why this motion?” to inspect the model components that contribute to local velocity. These are model-defined components, not independently observed physical causes." },
  { title: "Follow calculated tracer paths", copy: "Release passive tracers in Explore and follow their recorded paths. Inspect earlier points along a path without rewinding the live tracer." },
  { title: "Compare observations", copy: "In Learn, compare two fixed observation points, two prepared tracer paths, or a recorded moment with a saved reference. Each comparison uses a prepared Demo setup." },
] as const;

export const LANDING_README_URL = "https://github.com/murkatopiya/supercell/blob/main/README.md";
export const LANDING_SCIENCE_URL = "https://github.com/murkatopiya/supercell/blob/main/docs/README.md";

export const LANDING_WHATS_NEXT_TITLE = "Research & Development Roadmap";

export const LANDING_WHATS_NEXT_PRINCIPLE_LEAD = "Investigate → Understand → Experiment";
export const LANDING_WHATS_NEXT_PRINCIPLE_CLOSE = "Research directions, not rigid technical dependencies.";

export const LANDING_WHATS_NEXT_STAGES = [
  {
    id: "kinematics", kind: "current", status: "Current", topic: "Kinematics",
    copy: "Investigate prescribed 3D airflow, selected observed environmental wind profiles, calculated trajectories, velocity components, and supported diagnostics.",
    qualification: "The current research prototype is a kinematic laboratory, not a fully validated atmospheric simulation.",
  },
  {
    id: "thermodynamics", kind: "next", status: "Planned Research", topic: "Thermodynamics",
    copy: "Investigate temperature, moisture, buoyancy, atmospheric instability, and convective potential energy (CAPE/CIN).",
    qualification: "Future research may extend the laboratory toward physically justified coupling, subject to separate model design and validation.",
  },
  {
    id: "interactive-research", kind: "later", status: "Long-term Vision", topic: "Interactive Atmospheric Research",
    copy: "A configurable environment for user-defined atmospheric experiments: import and analyze compatible user-provided meteorological datasets, investigate interactive model output and calculated trajectories, and build reproducible research workflows.",
    qualification: "Longer-term development may explore independent numerical atmospheric modeling, subject to separate scientific design and validation.",
  },
] as const;
