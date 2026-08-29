import type { Vec3 } from "../../core/math/Vec3.js";
import type { AnalysisTiltingExplanationResult } from "./analysisTiltingQuery.js";

export class TrajectoryTiltingWhatIfError extends Error {
  readonly name = "TrajectoryTiltingWhatIfError";

  constructor(message: string) {
    super(message);
  }
}

export const WHAT_IF_THETA_MIN_RADIANS = 0;
export const WHAT_IF_THETA_MAX_RADIANS = Math.PI;

export type TrajectoryTiltingWhatIfUnavailableReason =
  | "COLUMN_UNAVAILABLE"
  | "OUT_OF_DOMAIN"
  | "GRADIENT_DEGENERATE"
  | "OMEGA_DEGENERATE"
  | "BOTH_DEGENERATE";

export type TrajectoryTiltingWhatIfUnavailableModel = {
  readonly kind: "UNAVAILABLE";
  readonly reason: TrajectoryTiltingWhatIfUnavailableReason;
};

/**
 * Counterfactual alignment for one ALIGNMENT_DEFINED sample.
 * Visualization convention (not physics): environmental ω_h stays
 * fixed; a hypothetical copy of prescribed ∇_h Vy rotates in the
 * world x-z plane. Architecture 62 §15 does not freeze which operand
 * rotates.
 *
 * Actual T1 is copied from the atomic explanation and is never
 * recomputed here. What-if T1 is A·B·cos(θ_whatif) only.
 */
export type TrajectoryTiltingWhatIfAvailableModel = {
  readonly kind: "AVAILABLE";
  readonly actualTiltingTendency: number;
  readonly whatIfTiltingTendency: number;
  readonly actualTheta: number;
  readonly thetaWhatIf: number;
  readonly omegaHMagnitude: number;
  readonly gradientMagnitude: number;
  readonly fixedOmegaVectorWorld: Vec3;
  readonly actualGradientVectorWorld: Vec3;
  readonly hypotheticalGradientVectorWorld: Vec3;
  /**
   * Sign of rotation around +Y from ω toward actual ∇.
   * Aligned / opposed fallback is +1. Visualization convention.
   */
  readonly branchSign: 1 | -1;
  readonly support: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
  readonly anchor?: Vec3;
};

export type TrajectoryTiltingWhatIfModel =
  | TrajectoryTiltingWhatIfAvailableModel
  | TrajectoryTiltingWhatIfUnavailableModel;

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function signedZero(value: number): number {
  return value === 0 ? 0 : value;
}

function assertThetaWhatIf(thetaWhatIf: number): void {
  if (!Number.isFinite(thetaWhatIf)) {
    throw new TrajectoryTiltingWhatIfError("thetaWhatIf must be finite");
  }
  if (thetaWhatIf < WHAT_IF_THETA_MIN_RADIANS || thetaWhatIf > WHAT_IF_THETA_MAX_RADIANS) {
    throw new TrajectoryTiltingWhatIfError(
      "thetaWhatIf must be in [0, π]; wrapping is not a what-if angle",
    );
  }
}

function rotateAroundY(
  x: number,
  z: number,
  phi: number,
): { x: number; z: number } {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return {
    x: x * c + z * s,
    z: -x * s + z * c,
  };
}

/**
 * Sign of û × ĝ along +Y in the x-z plane.
 * Zero cross (aligned / opposed) uses deterministic +1.
 */
function branchSignFromActual(
  omega: Vec3,
  gradient: Vec3,
): 1 | -1 {
  const omegaMag = Math.hypot(omega.x, omega.z);
  const gradientMag = Math.hypot(gradient.x, gradient.z);
  if (omegaMag === 0 || gradientMag === 0) {
    throw new TrajectoryTiltingWhatIfError(
      "ALIGNMENT_DEFINED requires nonzero world-horizontal operand vectors",
    );
  }
  const crossY =
    (omega.z / omegaMag) * (gradient.x / gradientMag) -
    (omega.x / omegaMag) * (gradient.z / gradientMag);
  if (crossY > 0) {
    return 1;
  }
  if (crossY < 0) {
    return -1;
  }
  return 1;
}

/**
 * Canonical what-if T1. Exact θ = π/2 maps to +0 because
 * Math.cos(π/2) is a tiny IEEE residual, not a physical near-zero band.
 * Nearby angles are not classified as zero.
 */
export function counterfactualTiltingTendency(
  omegaHMagnitude: number,
  gradientMagnitude: number,
  thetaWhatIf: number,
): number {
  if (thetaWhatIf === Math.PI / 2) {
    return 0;
  }
  return signedZero(
    omegaHMagnitude * gradientMagnitude * Math.cos(thetaWhatIf),
  );
}

export function initialThetaWhatIfFromActual(
  explanation: AnalysisTiltingExplanationResult,
): number | undefined {
  if (
    explanation.status === "COLUMN_UNAVAILABLE" ||
    explanation.status === "OUT_OF_DOMAIN"
  ) {
    return undefined;
  }
  if (explanation.alignment.state !== "ALIGNMENT_DEFINED") {
    return undefined;
  }
  return explanation.alignment.theta;
}

/**
 * Ephemeral what-if alignment. Does not mutate `explanation`.
 * Architecture 62 Slice F.
 */
export function createTrajectoryTiltingWhatIfModel(
  explanation: AnalysisTiltingExplanationResult,
  thetaWhatIf: number,
  anchor?: Vec3,
): TrajectoryTiltingWhatIfModel {
  if (explanation.status === "COLUMN_UNAVAILABLE") {
    return { kind: "UNAVAILABLE", reason: "COLUMN_UNAVAILABLE" };
  }
  if (explanation.status === "OUT_OF_DOMAIN") {
    return { kind: "UNAVAILABLE", reason: "OUT_OF_DOMAIN" };
  }
  if (explanation.alignment.state !== "ALIGNMENT_DEFINED") {
    return { kind: "UNAVAILABLE", reason: explanation.alignment.state };
  }

  assertThetaWhatIf(thetaWhatIf);

  const omega: Vec3 = {
    x: explanation.worldHorizontalVorticity.omegaX,
    y: 0,
    z: explanation.worldHorizontalVorticity.omegaZ,
  };
  const gradient: Vec3 = {
    x: explanation.updraftHorizontalGradient.dVyDx,
    y: 0,
    z: explanation.updraftHorizontalGradient.dVyDz,
  };
  const branchSign = branchSignFromActual(omega, gradient);
  const omegaMag = Math.hypot(omega.x, omega.z);
  const ox = omega.x / omegaMag;
  const oz = omega.z / omegaMag;
  const rotated = rotateAroundY(ox, oz, branchSign * thetaWhatIf);
  const B = explanation.gradientMagnitude;
  const hypothetical: Vec3 = {
    x: rotated.x * B,
    y: 0,
    z: rotated.z * B,
  };

  const model: TrajectoryTiltingWhatIfAvailableModel = {
    kind: "AVAILABLE",
    actualTiltingTendency: explanation.tiltingTendency,
    whatIfTiltingTendency: counterfactualTiltingTendency(
      explanation.omegaHMagnitude,
      explanation.gradientMagnitude,
      thetaWhatIf,
    ),
    actualTheta: explanation.alignment.theta,
    thetaWhatIf,
    omegaHMagnitude: explanation.omegaHMagnitude,
    gradientMagnitude: explanation.gradientMagnitude,
    fixedOmegaVectorWorld: copyVec3(omega),
    actualGradientVectorWorld: copyVec3(gradient),
    hypotheticalGradientVectorWorld: hypothetical,
    branchSign,
    support: explanation.status,
  };
  if (anchor === undefined) {
    return model;
  }
  return { ...model, anchor: copyVec3(anchor) };
}
