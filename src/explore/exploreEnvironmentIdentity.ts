export const EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED = "demo-prescribed";
export const EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED = "goshen-2009-observed";
export const EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED =
  "prospect-valley-2010-observed";
export const EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED = "dumas-2010-observed";
export const EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED = "moore-2013-observed";

export type ExploreEnvironmentIdentity =
  | typeof EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED
  | typeof EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED
  | typeof EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED
  | typeof EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED
  | typeof EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED;

export const EXPLORE_ENVIRONMENT_IDENTITIES = [
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
] as const satisfies readonly ExploreEnvironmentIdentity[];

export const DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY =
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED;

export const DEMO_PRESCRIBED_ENVIRONMENT_LABEL =
  "Demo prescribed environment";

export const GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL = "Goshen · 2009";

export const PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL =
  "Prospect Valley · 2010";

export const DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL = "Dumas · 2010";

export const MOORE_2013_OBSERVED_ENVIRONMENT_LABEL = "Moore · 2013";

export const GOSHEN_OBSERVED_ENVIRONMENT_COPY =
  "Observed: environmental wind, VORTEX2 / NSSL1 / Bushnell, 2009-06-05 21:55:22 UTC (EOL 114.114).";

export const PROSPECT_VALLEY_OBSERVED_ENVIRONMENT_COPY =
  "Observed: environmental wind, VORTEX2 / NSSL1, 2010-05-26 22:23:46 UTC (EOL 114.114).";

export const DUMAS_OBSERVED_ENVIRONMENT_COPY =
  "Observed: environmental wind, VORTEX2 / NSSL2, 2010-05-18 21:52:18 UTC (EOL 114.114).";

export const MOORE_OBSERVED_ENVIRONMENT_COPY =
  "Observed: environmental wind, operational RAOB / IGRA / OUN, 2013-05-20, release 16:51 UTC (nominal observation hour 17 UTC).";

export const GOSHEN_PRESCRIBED_STORM_COPY =
  "Prescribed: storm-local kinematic model and storm motion C in this laboratory.";

export const GOSHEN_SANDBOX_ANTI_CLAIM =
  "This uses a real observed environmental wind profile inside a prescribed kinematic laboratory; it is NOT a simulation or reconstruction of the Goshen supercell.";

export const PROSPECT_VALLEY_SANDBOX_ANTI_CLAIM =
  "This uses a real observed environmental wind profile inside a prescribed kinematic laboratory; it is NOT a simulation or reconstruction of the Prospect Valley supercell.";

export const DUMAS_SANDBOX_ANTI_CLAIM =
  "This uses a real observed environmental wind profile inside a prescribed kinematic laboratory; it is NOT a simulation or reconstruction of the Dumas supercell.";

export const MOORE_SANDBOX_ANTI_CLAIM =
  "This uses a real observed environmental wind profile inside a prescribed kinematic laboratory; it is NOT a simulation or reconstruction of the Moore supercell.";

export interface ExploreEnvironmentOption {
  readonly identity: ExploreEnvironmentIdentity;
  readonly label: string;
}

export const EXPLORE_ENVIRONMENT_OPTIONS: readonly ExploreEnvironmentOption[] = [
  {
    identity: EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    label: DEMO_PRESCRIBED_ENVIRONMENT_LABEL,
  },
  {
    identity: EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    label: GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  },
  {
    identity: EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    label: PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL,
  },
  {
    identity: EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    label: DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL,
  },
  {
    identity: EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    label: MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
  },
];

export function exploreEnvironmentLabel(
  identity: ExploreEnvironmentIdentity,
): string {
  return EXPLORE_ENVIRONMENT_OPTIONS.find(
    (option) => option.identity === identity,
  )!.label;
}

export interface ExploreEnvironmentHonesty {
  readonly observed: string;
  readonly prescribed: string;
  readonly antiClaim: string;
}

const OBSERVED_HONESTY: Record<
  Exclude<
    ExploreEnvironmentIdentity,
    typeof EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED
  >,
  ExploreEnvironmentHonesty
> = {
  [EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED]: {
    observed: GOSHEN_OBSERVED_ENVIRONMENT_COPY,
    prescribed: GOSHEN_PRESCRIBED_STORM_COPY,
    antiClaim: GOSHEN_SANDBOX_ANTI_CLAIM,
  },
  [EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED]: {
    observed: PROSPECT_VALLEY_OBSERVED_ENVIRONMENT_COPY,
    prescribed: GOSHEN_PRESCRIBED_STORM_COPY,
    antiClaim: PROSPECT_VALLEY_SANDBOX_ANTI_CLAIM,
  },
  [EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED]: {
    observed: DUMAS_OBSERVED_ENVIRONMENT_COPY,
    prescribed: GOSHEN_PRESCRIBED_STORM_COPY,
    antiClaim: DUMAS_SANDBOX_ANTI_CLAIM,
  },
  [EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED]: {
    observed: MOORE_OBSERVED_ENVIRONMENT_COPY,
    prescribed: GOSHEN_PRESCRIBED_STORM_COPY,
    antiClaim: MOORE_SANDBOX_ANTI_CLAIM,
  },
};

export function exploreEnvironmentHonesty(
  identity: ExploreEnvironmentIdentity,
): ExploreEnvironmentHonesty | undefined {
  if (identity === EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED) {
    return undefined;
  }
  return OBSERVED_HONESTY[identity];
}
