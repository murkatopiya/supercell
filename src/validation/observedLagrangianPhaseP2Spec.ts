/** P2 protocol literals only. No collector, environment, fixture loader or I/O. */
import { E1_SPEC, FROZEN_E1_STORM_ONLY, FROZEN_MANIFEST_SHA256 } from "./observedCMatrixE1Spec.js";

function immutable<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(immutable); Object.freeze(value);
  }
  return value;
}
export const P2_SPEC = immutable({
  id: "observed-lagrangian-phase-p2-qualification/v1",
  documentSha256: "fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b",
  designBaseline: "a911e5c8283b960ce50c4b0bf69e44dbd90ac982",
  evidenceSchema: "p2-controller-decision/v1",
  executionAuthority: "NOT_AUTHORIZED",
  durations: [180, 360, 540], Tmin: 180, ticksPerSecond: 16, t0: 0, stride: 1,
  resolutions: [{ id: "R0", h: 0.5, ticks: 8 }, { id: "R1", h: 0.25, ticks: 4 },
    { id: "R2", h: 0.125, ticks: 2 }, { id: "R3", h: 0.0625, ticks: 1 }],
  candidates: [{ T: 540, h: 0.5 }, { T: 540, h: 0.25 }, { T: 360, h: 0.5 },
    { T: 360, h: 0.25 }, { T: 180, h: 0.5 }, { T: 180, h: 0.25 }],
  seeds: [
    { id: "S1-L", x: 3200, y: 2000, z: 2400 }, { id: "S2-L", x: -2400, y: 2000, z: 3200 },
    { id: "S3-L", x: -3200, y: 2000, z: -2400 }, { id: "S4-L", x: 2400, y: 2000, z: -3200 },
    { id: "S1-H", x: 3200, y: 3000, z: 2400 }, { id: "S2-H", x: -2400, y: 3000, z: 3200 },
    { id: "S3-H", x: -3200, y: 3000, z: -2400 }, { id: "S4-H", x: 2400, y: 3000, z: -3200 },
  ],
  memberIds: E1_SPEC.memberIds,
  // Explicit inheritance only: no historical P estimator policy or schema object.
  cases: E1_SPEC.cases.map(c => ({ id: c.id, members: c.members.map(m => ({ id: m.id, C: m.C })),
    analysisAvailable: c.timePath !== null })),
  inherited: { matrixId: E1_SPEC.matrixId, C0: E1_SPEC.C0, alpha: E1_SPEC.alpha,
    storm: FROZEN_E1_STORM_ONLY, e1ManifestSha256: FROZEN_MANIFEST_SHA256,
    operands: ["environment", "updraft", "rotation", "lowerInflow", "upperOutflow", "downdraft", "nearGroundOutflow"] },
} as const);
export type Candidate = Readonly<{ T: number; h: number }>;
export const p2RunId = (caseId: string, memberId: string, seedId: string, resolutionId: string): string =>
  `${caseId}/${memberId}/${seedId}/${resolutionId}`;
