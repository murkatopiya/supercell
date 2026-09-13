/** Phase P literals only. No environment, I/O, production or collector imports. */
import { E1_SPEC, FROZEN_E1_STORM_ONLY, FROZEN_MANIFEST_SHA256 } from "./observedCMatrixE1Spec.js";

function immutable<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
}

export const PHASE_P_SPEC = immutable({
  id: "observed-lagrangian-phase-p-qualification/v1",
  freezeCommit: "5c0d13a",
  document: "docs/research/2026-09-13-observed-lagrangian-phase-p-qualification-specification.md",
  documentSha256: "bab9ac1a5e0f8f7157ef0e5c1d826b513f5f8ff0924f81d7490dcf30ea38f190",
  stageVariable: "OBSERVED_LAGRANGIAN_PHASE_P_STAGE",
  stage: "PHASE_P",
  seeds: [
    { id: "S1-L", x: 3200, y: 2000, z: 2400 },
    { id: "S2-L", x: -2400, y: 2000, z: 3200 },
    { id: "S3-L", x: -3200, y: 2000, z: -2400 },
    { id: "S4-L", x: 2400, y: 2000, z: -3200 },
    { id: "S1-H", x: 3200, y: 3000, z: 2400 },
    { id: "S2-H", x: -2400, y: 3000, z: 3200 },
    { id: "S3-H", x: -3200, y: 3000, z: -2400 },
    { id: "S4-H", x: 2400, y: 3000, z: -3200 },
  ],
  durations: [180, 360, 540], Tmin: 180,
  resolutions: [
    { id: "R0", dt: 0.5, ticks: 8 }, { id: "R1", dt: 0.25, ticks: 4 },
    { id: "R2", dt: 0.125, ticks: 2 }, { id: "R3", dt: 0.0625, ticks: 1 },
  ],
  ticksPerSecond: 16, maxRefinement: 3, t0: 0, stride: 1,
  candidates: [
    { T: 540, h: 0.5 }, { T: 540, h: 0.25 },
    { T: 360, h: 0.5 }, { T: 360, h: 0.25 },
    { T: 180, h: 0.5 }, { T: 180, h: 0.25 },
  ],
  budget: {
    position: 10, vertical: 3, response: 10, verticalResponse: 3,
    historyAbsolute: 1e-6, historyRelative: 0.01,
    pointAbsolute: 5e-6, pointRelative: 0.02,
    exposureAbsolute: 1e-5, exposureRelative: 0.01, exposureFloor: 1e-3,
    eventAbsoluteSeconds: 1, eventStepFactor: 2,
    crossingExpansionSteps: 2, nonWorseningFraction: 0.1,
    oracleAbsoluteMetres: 1e-9, oracleUlpFactor: 128, epsilon: 2 ** -52,
  },
  policies: {
    integrator: "EulerIntegrator", domain: "ATMOSPHERIC_TRACER_DOMAIN",
    advection: "Source", escPrimary: "Analysis/FULL_SUPPORT", secondary: "Source/support-gated",
    unavailableAnalysis: "N_A/COLUMN_UNAVAILABLE", birth: "independent-one-tracer-t0",
    recording: "initial-and-every-accepted-step", sourceExit: "stop-no-reentry",
    ground: "production-clip-terminal-excluded", prefix: "irreversible-all-five-members",
    admission: "all-eight-seeds-all-four-cases-all-four-resolutions-full-duration",
    selection: "longest-T-then-coarsest-qualified-h", comparison: "integer-ticks-no-interpolation",
    crossing: "bracket-expanded-by-2h-pointwise-only",
    nonWorsening: "common-three-resolution-interval-finer-pair-budget",
    materialThresholds: "STILL_OPEN",
  },
  operands: ["environment", "updraft", "rotation", "lowerInflow", "upperOutflow", "downdraft", "nearGroundOutflow"],
  schemas: {
    manifest: "observed-lagrangian-phase-p-manifest/v1",
    trajectory: "observed-lagrangian-phase-p-trajectory/v1",
    diagnostic: "observed-lagrangian-phase-p-diagnostic/v1",
    summary: "observed-lagrangian-phase-p-summary/v1",
    execution: "observed-lagrangian-phase-p-execution/v1",
  },
} as const);

export const PHASE_P_CASES = immutable(E1_SPEC.cases.map(c => ({
  id: c.id, sourceIdentity: c.sourceIdentity, heightDatum: c.heightDatum,
  fixturePath: c.fixturePath, fixtureHash: c.fixtureHash, timePath: c.timePath, timeHash: c.timeHash,
  coverage: c.coverage, members: c.members,
  analysisAvailable: c.timePath !== null,
  primary: c.timePath !== null ? "Analysis" as const : "Source" as const,
})));
export const PHASE_P_INHERITED = immutable({
  matrixId: E1_SPEC.matrixId, C0: E1_SPEC.C0, alpha: E1_SPEC.alpha,
  kernel: E1_SPEC.kernel, storm: FROZEN_E1_STORM_ONLY, e1Digest: FROZEN_MANIFEST_SHA256,
});
/** SHA-256 of canonical {spec,cases,inherited}; pinned after static transcription review. */
export const PHASE_P_MANIFEST_SHA256 = "ddab074945d34cd70891e4f0ed1c9693f28319b92883e55272ea9dad2b1198d9";
export type PhasePCase = typeof PHASE_P_CASES[number];
export type PhasePSeed = typeof PHASE_P_SPEC.seeds[number];
export type PhasePResolution = typeof PHASE_P_SPEC.resolutions[number];
