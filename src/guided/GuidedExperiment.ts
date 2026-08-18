/**
 * Public Guided Experiment identity and catalog copy.
 * docs/architecture/20-guided-runtime-architecture.md
 *
 * Product identity, not composition pedagogy and not physics.
 * Mapping to composition lives at the application boundary.
 */

export const GuidedExperimentId = {
  InflowToUpperOutflow: "inflow-to-upper-outflow",
  DowndraftPathToGround: "downdraft-path-to-ground",
  NearGroundOutflow: "near-ground-outflow",
} as const;

export type GuidedExperimentId =
  (typeof GuidedExperimentId)[keyof typeof GuidedExperimentId];

export interface GuidedExperimentDefinition {
  readonly id: GuidedExperimentId;
  readonly title: string;
  readonly observe: string;
  readonly demonstrates: string;
  readonly doesNotMean: string;
}

const INFLOW_TO_UPPER_OUTFLOW: GuidedExperimentDefinition = {
  id: GuidedExperimentId.InflowToUpperOutflow,
  title: "Inflow to upper outflow",
  observe:
    "Watch curated lower-level inflow occupants approach, rise through the prescribed storm, and enter upper-level outward transport as one connected family.",
  demonstrates:
    "Prescribed storm-relative pathlines from the lower inflow layer can enter the deep updraft region and later the upper outflow region.",
  doesNotMean:
    "Not a realistic parcel, mesocyclone capture, or closed circulation, and not the same air later becoming the downdraft or near-ground exhibits.",
};

const DOWNDRAFT_PATH_TO_GROUND: GuidedExperimentDefinition = {
  id: GuidedExperimentId.DowndraftPathToGround,
  title: "Downdraft path to the ground",
  observe:
    "Watch a curated occupant descend through the prescribed downdraft region until it exits the atmospheric domain at the ground.",
  demonstrates:
    "A prescribed storm-relative pathline can occupy the downdraft region while descending and then leave the atmospheric tracer domain at the ground.",
  doesNotMean:
    "Domain exit is pathline termination, not a cold pool, gust front, RFD/FFD, or the source of the near-ground outflow experiment.",
};

const NEAR_GROUND_OUTFLOW: GuidedExperimentDefinition = {
  id: GuidedExperimentId.NearGroundOutflow,
  title: "Near-ground outflow",
  observe:
    "Watch a curated near-ground occupant move outward relative to this experiment's outflow axis, remaining in that layer long enough to see the outward path.",
  demonstrates:
    "A prescribed storm-relative near-ground pathline can be advected through a divergent horizontal outflow region.",
  doesNotMean:
    "Not cold-pool spreading or a density current, and not the same air that descended in the downdraft exhibit.",
};

/**
 * Public catalog in canonical order. Read-only. Not a plugin registry.
 */
export const GUIDED_EXPERIMENTS: readonly GuidedExperimentDefinition[] = [
  INFLOW_TO_UPPER_OUTFLOW,
  DOWNDRAFT_PATH_TO_GROUND,
  NEAR_GROUND_OUTFLOW,
];

const GUIDED_EXPERIMENT_BY_ID: {
  readonly [Id in GuidedExperimentId]: GuidedExperimentDefinition;
} = {
  [GuidedExperimentId.InflowToUpperOutflow]: INFLOW_TO_UPPER_OUTFLOW,
  [GuidedExperimentId.DowndraftPathToGround]: DOWNDRAFT_PATH_TO_GROUND,
  [GuidedExperimentId.NearGroundOutflow]: NEAR_GROUND_OUTFLOW,
};

export function guidedExperimentById(
  id: GuidedExperimentId,
): GuidedExperimentDefinition {
  return GUIDED_EXPERIMENT_BY_ID[id];
}
