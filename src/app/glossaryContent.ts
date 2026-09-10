import { T1_EXPLANATION, SOURCE_EXPLANATION, ANALYSIS_EXPLANATION, ANALYSIS_UNAVAILABLE_COPY, ANALYSIS_FULL_COPY, ANALYSIS_BOUNDARY_COPY } from "./publicDiagnosticCopy.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import { labelForContribution } from "../ui/tracer/tracerContributionLabels.js";

/**
 * Public Glossary V1. Vocabulary for terms already visible in the laboratory.
 * Not How It Works, not Architecture 62, not a physics derivation.
 */

export const GLOSSARY_TITLE = "Glossary";

export const GLOSSARY_INTRO =
  "Short meanings for terms and quantities you can see in the laboratory. User Guide is the practical manual. How It Works explains the conceptual model.";

export const GLOSSARY_V_TOTAL_EQUATION =
  "V_total = V_environment + V_updraft + V_rotation + V_lower-inflow + V_upper-outflow + V_downdraft + V_near-ground-outflow";

export const GLOSSARY_V_TOTAL =
  "V_total is the laboratory velocity field that carries passive tracers. It is the sum of the seven contributions below, sampled at the same position and time.";

export const GLOSSARY_VELOCITY_WARNING =
  "These components form the prescribed laboratory velocity field. They are not seven independently observed components of a real storm.";

export const GLOSSARY_VELOCITY_CONTRIBUTIONS = [
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[0],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[0]),
    definition:
      "Environmental wind contribution used in tracer motion in the storm-relative laboratory frame. It is derived from the selected environmental wind representation, relative to prescribed storm motion.",
  },
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[1],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[1]),
    definition: "Prescribed upward storm-local velocity component.",
  },
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[2],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[2]),
    definition: "Prescribed rotational storm-local velocity component.",
  },
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[3],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[3]),
    definition:
      "Prescribed inward radial flow concentrated in the lower part of the laboratory.",
  },
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[4],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[4]),
    definition: "Prescribed outward radial flow aloft.",
  },
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[5],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[5]),
    definition: "Prescribed downward storm-local velocity component.",
  },
  {
    key: DEMO_VELOCITY_CONTRIBUTION_KEYS[6],
    term: labelForContribution(DEMO_VELOCITY_CONTRIBUTION_KEYS[6]),
    definition: "Prescribed outward flow concentrated near the surface.",
  },
] as const;

export const GLOSSARY_SOURCE =
  SOURCE_EXPLANATION;

export const GLOSSARY_ANALYSIS =
  ANALYSIS_EXPLANATION;

export const GLOSSARY_SOURCE_ADVECTS_ANALYSIS_EXPLAINS =
  "Source advects. Analysis explains.";

export const GLOSSARY_ANALYSIS_UNAVAILABLE =
  ANALYSIS_UNAVAILABLE_COPY;

export const GLOSSARY_PASSIVE_TRACER =
  "A passive tracer is a moving probe carried by V_total. It does not affect the airflow and does not acquire or generate vorticity.";

export const GLOSSARY_RECORDED_TRAJECTORY =
  "The recorded trajectory is the sequence of recorded tracer positions and simulation times.";

export const GLOSSARY_HISTORICAL_SAMPLE =
  "A historical sample is an exact recorded trajectory sample, not an interpolated point.";

export const GLOSSARY_ANALYSIS_T1 =
  T1_EXPLANATION;

export const GLOSSARY_T1_EQUATION = "T1 = ω_h,env · ∇_h V_y,updraft";

export const GLOSSARY_T1_EQUATION_COS = "T1 = |ω_h| |∇_h V_y| cos θ";

export const GLOSSARY_OMEGA_H =
  "ω_h is environmental horizontal vorticity at the altitude occupied by the tracer or sample.";

export const GLOSSARY_GRADIENT =
  "∇_h V_y is the horizontal gradient of the prescribed updraft vertical velocity.";

export const GLOSSARY_THETA =
  "θ is the alignment angle between ω_h and ∇_h V_y when both directions are defined.";

export const GLOSSARY_WHAT_IF =
  "What-if geometry is a counterfactual visualization that keeps environmental ω_h and vector magnitudes fixed while changing only the hypothetical alignment of the prescribed gradient. Laboratory state remains unchanged.";

export const GLOSSARY_FULL = `FULL_SUPPORT: ${ANALYSIS_FULL_COPY}`;

export const GLOSSARY_BOUNDARY = `BOUNDARY_CONDITIONED: ${ANALYSIS_BOUNDARY_COPY}`;

export const GLOSSARY_OOD =
  "OUT_OF_DOMAIN (OOD): the Analysis diagnostic is unavailable outside the supported domain. It is not treated as zero.";

export const GLOSSARY_COLUMN_UNAVAILABLE =
  "COLUMN_UNAVAILABLE: this environment does not include an Analysis representation. This is Analysis unavailable, not a broken Source environment and not a Source fallback.";

export const GLOSSARY_OCCUPANCY_TRAIL =
  "The occupancy / tracer trail shows where the tracer has traveled. Its tracer color does not encode Analysis T1. Occupancy remains visible where Analysis is unavailable or out of domain. Occupancy red does not mean positive T1.";

export const GLOSSARY_OCCUPANCY_COLOR_CALLOUT =
  "Tracer/occupancy color does not encode T1.";

export const GLOSSARY_NAV = [
  { id: "glossary-velocity", label: "Velocity field" },
  { id: "glossary-source-analysis", label: "Source & Analysis" },
  { id: "glossary-trajectory", label: "Trajectory & T1" },
  { id: "glossary-support", label: "Support" },
  { id: "glossary-occupancy", label: "Occupancy" },
  { id: "glossary-data", label: "Data" },
] as const;

export const GLOSSARY_SUPPORT_STATES = [
  GLOSSARY_FULL,
  GLOSSARY_BOUNDARY,
  GLOSSARY_OOD,
  GLOSSARY_COLUMN_UNAVAILABLE,
] as const;

export function glossaryTermDefinition(entry: string): {
  term: string;
  definition: string;
} {
  const separator = ": ";
  const index = entry.indexOf(separator);
  return {
    term: entry.slice(0, index),
    definition: entry.slice(index + separator.length),
  };
}

export const GLOSSARY_ANALYSIS_OVERLAY =
  "The Analysis T1 overlay colors supported trajectory segments by Analysis T1 using the fixed symmetric diagnostic scale.";

export const EOL_SOUNDING_DATASET_ID = "114.114";

export const EOL_SOUNDING_DATASET_DOI = "10.5065/D6CC0Z0Q";

export const EOL_SOUNDING_DATASET_NAME =
  "NSSL Mobile GPS Advanced Upper-Air Sounding System";

export const EOL_SOUNDING_DATASET_URL = `https://data.eol.ucar.edu/dataset/${EOL_SOUNDING_DATASET_ID}`;

export const EOL_SOUNDING_DATASET_DOI_URL = `https://doi.org/${EOL_SOUNDING_DATASET_DOI}`;

export const IGRA_ARCHIVE_NAME =
  "NOAA/NCEI Integrated Global Radiosonde Archive (IGRA) v2.2";

export const IGRA_ARCHIVE_SHORT_NAME = "NOAA/NCEI IGRA v2.2";

export const IGRA_STATION_ID = "USM00072357";

export const IGRA_DSI = "DSI-6301";

export const IGRA_ARCHIVE_DOI = "10.7289/V5X63K0Q";

export const IGRA_ARCHIVE_URL =
  "https://www.ncei.noaa.gov/products/weather-balloon/integrated-global-radiosonde-archive";

export const IGRA_ARCHIVE_DOI_URL = `https://doi.org/${IGRA_ARCHIVE_DOI}`;

export const GLOSSARY_ATTRIBUTION_LEAD =
  "Dataset attribution names the origin of environmental sounding profiles used in the laboratory. Landing event/case links are contextual event information and are not sounding-data citations.";

export const GLOSSARY_EOL_ATTRIBUTION = `EOL dataset ${EOL_SOUNDING_DATASET_ID} / ${EOL_SOUNDING_DATASET_NAME}, DOI ${EOL_SOUNDING_DATASET_DOI}. Used for the Goshen, Prospect Valley, and Dumas Source profiles and matching Analysis representations.`;

export const GLOSSARY_IGRA_ATTRIBUTION = `${IGRA_ARCHIVE_NAME}, station ${IGRA_STATION_ID} (Norman / OUN), ${IGRA_DSI}. Used for the Moore Source profile. Moore has no Analysis representation.`;
