export const EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED = "demo-prescribed";
export const EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED = "goshen-2009-observed";

export type ExploreEnvironmentIdentity =
  | typeof EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED
  | typeof EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED;

export const DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY =
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED;

export const DEMO_PRESCRIBED_ENVIRONMENT_LABEL =
  "Demo prescribed environment";

export const GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL =
  "Goshen 2009 observed environment";

export const GOSHEN_OBSERVED_ENVIRONMENT_COPY =
  "Observed: environmental wind, VORTEX2 / NSSL1 / Bushnell, 2009-06-05 21:55:22 UTC (EOL 114.114).";

export const GOSHEN_PRESCRIBED_STORM_COPY =
  "Prescribed: storm-local kinematic model and storm motion C in this laboratory.";

export const GOSHEN_SANDBOX_ANTI_CLAIM =
  "This uses a real observed environmental wind profile inside a prescribed kinematic laboratory; it is NOT a simulation or reconstruction of the Goshen supercell.";
