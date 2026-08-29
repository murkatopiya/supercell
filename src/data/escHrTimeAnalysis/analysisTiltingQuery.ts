import type { Vec3 } from "../../core/math/Vec3.js";
import {
  worldHorizontalVorticityFromAtmospheric,
  type WorldHorizontalVorticity,
} from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import type {
  HorizontalGradientOfVerticalVelocity,
  VerticalEnvelopeUpdraftField,
} from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
  queryAnalysisNativeSegmentVorticityAt,
  type AnalysisColumnUnavailableResult,
  type AnalysisNativeContainingSegment,
  type AnalysisOutOfDomainResult,
} from "./analysisQuery.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import type {
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisProvenance,
} from "./types.js";

/**
 * Laboratory diagnostic tilting tendency using Analysis-derived
 * environmental ω_h and a prescribed updraft ∇_h Vy.
 * Architecture 61. Not observational supercell tilting.
 */
export const ANALYSIS_TILTING_PHYSICAL_IDENTITY = "T_tilt,y";
export const ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND =
  "Analysis native-segment ω_h";
export const ANALYSIS_TILTING_STORM_LOCAL_OPERAND =
  "prescribed-updraft-horizontal-gradient-of-vertical-velocity";

type AnalysisTiltingSupportedFields = {
  readonly representation: typeof ANALYSIS_QUERY_REPRESENTATION;
  readonly method: typeof NATIVE_CONTAINING_SEGMENT_METHOD;
  readonly physicalIdentity: typeof ANALYSIS_TILTING_PHYSICAL_IDENTITY;
  readonly environmentalOperand: typeof ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND;
  readonly stormLocalOperand: typeof ANALYSIS_TILTING_STORM_LOCAL_OPERAND;
  readonly segment: AnalysisNativeContainingSegment;
  /** Signed T_tilt,y. Units: s⁻². */
  readonly tiltingTendency: number;
  readonly provenance: EscHrTimeAnalysisProvenance;
};

export type AnalysisTiltingTendencyResult =
  | ({
      readonly status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
    } & AnalysisTiltingSupportedFields)
  | AnalysisOutOfDomainResult
  | AnalysisColumnUnavailableResult;

/**
 * Angle between world environmental ω_h and prescribed ∇_h Vy.
 * θ and cos θ exist only when both magnitudes are exact-zero
 * non-degenerate after signed-zero normalization and hypot.
 * Architecture 62 §8.3. Units: radians, θ ∈ [0, π].
 */
export type AnalysisTiltingAlignment =
  | {
      readonly state: "ALIGNMENT_DEFINED";
      /**
       * T1 / (|ω_h| |∇_h Vy|), IEEE-clamped to [-1, +1].
       * Dimensionless.
       */
      readonly cosTheta: number;
      /** Unsigned angle. Radians, ∈ [0, π]. */
      readonly theta: number;
    }
  | { readonly state: "GRADIENT_DEGENERATE" }
  | { readonly state: "OMEGA_DEGENERATE" }
  | { readonly state: "BOTH_DEGENERATE" };

export type AnalysisTiltingExplanationResult =
  | ({
      readonly status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
      /**
       * World-horizontal environmental vorticity at the queried
       * altitude. omegaX along +X East, omegaZ along +Z South.
       * Units: s⁻¹. Exact T1 operands.
       */
      readonly worldHorizontalVorticity: WorldHorizontalVorticity;
      /**
       * Prescribed-updraft ∇_h Vy = (∂Vy/∂x, ∂Vy/∂z). Units: s⁻¹.
       * Exact T1 operands.
       */
      readonly updraftHorizontalGradient: HorizontalGradientOfVerticalVelocity;
      /** |ω_h|. Units: s⁻¹. */
      readonly omegaHMagnitude: number;
      /** |∇_h Vy|. Units: s⁻¹. */
      readonly gradientMagnitude: number;
      readonly alignment: AnalysisTiltingAlignment;
    } & AnalysisTiltingSupportedFields)
  | AnalysisOutOfDomainResult
  | AnalysisColumnUnavailableResult;

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new EscAnalysisError(`${label} must be finite`);
  }
}

function signedZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * IEEE guard so acos and consumers never see a cosine slightly
 * outside [-1, +1]. Not an alignment-degeneracy epsilon.
 */
function clampUnitCosine(value: number): number {
  if (value > 1) {
    return 1;
  }
  if (value < -1) {
    return -1;
  }
  return value;
}

function alignmentFromOperands(
  tiltingTendency: number,
  omegaHMagnitude: number,
  gradientMagnitude: number,
): AnalysisTiltingAlignment {
  const omegaDegenerate = omegaHMagnitude === 0;
  const gradientDegenerate = gradientMagnitude === 0;
  if (omegaDegenerate && gradientDegenerate) {
    return { state: "BOTH_DEGENERATE" };
  }
  if (omegaDegenerate) {
    return { state: "OMEGA_DEGENERATE" };
  }
  if (gradientDegenerate) {
    return { state: "GRADIENT_DEGENERATE" };
  }

  const cosTheta = clampUnitCosine(
    tiltingTendency / (omegaHMagnitude * gradientMagnitude),
  );
  return {
    state: "ALIGNMENT_DEFINED",
    cosTheta,
    theta: Math.acos(cosTheta),
  };
}

function projectScalarTendency(
  explanation: AnalysisTiltingExplanationResult,
): AnalysisTiltingTendencyResult {
  if (
    explanation.status === "COLUMN_UNAVAILABLE" ||
    explanation.status === "OUT_OF_DOMAIN"
  ) {
    return explanation;
  }

  return {
    status: explanation.status,
    representation: explanation.representation,
    method: explanation.method,
    physicalIdentity: explanation.physicalIdentity,
    environmentalOperand: explanation.environmentalOperand,
    stormLocalOperand: explanation.stormLocalOperand,
    segment: explanation.segment,
    tiltingTendency: explanation.tiltingTendency,
    provenance: explanation.provenance,
  };
}

/**
 * Atomic Analysis laboratory tilting explanation at world P.
 *
 * One evaluation yields T1, world environmental ω_h, prescribed
 * ∇_h Vy, magnitudes, alignment, support, and provenance.
 * Architecture 62 Slice A. Architecture 61 validity unchanged.
 *
 * T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z  [s⁻²]
 *
 * Does not call DiagnosticTiltingTendency.sample.
 */
export function queryAnalysisTiltingExplanationAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): AnalysisTiltingExplanationResult {
  assertFinite(position.x, "position.x");
  assertFinite(position.y, "position.y");
  assertFinite(position.z, "position.z");
  assertFinite(time, "time");

  const vorticityResult = queryAnalysisNativeSegmentVorticityAt(
    column,
    position.y,
  );
  if (
    vorticityResult.status === "COLUMN_UNAVAILABLE" ||
    vorticityResult.status === "OUT_OF_DOMAIN"
  ) {
    return vorticityResult;
  }

  const world = worldHorizontalVorticityFromAtmospheric(
    vorticityResult.vorticity,
  );
  const gradient = updraft.horizontalGradientOfVerticalVelocity(
    position,
    time,
  );
  const worldHorizontalVorticity: WorldHorizontalVorticity = {
    omegaX: signedZero(world.omegaX),
    omegaZ: signedZero(world.omegaZ),
  };
  const updraftHorizontalGradient: HorizontalGradientOfVerticalVelocity = {
    dVyDx: signedZero(gradient.dVyDx),
    dVyDz: signedZero(gradient.dVyDz),
  };
  const omegaHMagnitude = Math.hypot(
    worldHorizontalVorticity.omegaX,
    worldHorizontalVorticity.omegaZ,
  );
  const gradientMagnitude = Math.hypot(
    updraftHorizontalGradient.dVyDx,
    updraftHorizontalGradient.dVyDz,
  );
  const tiltingTendency = signedZero(
    worldHorizontalVorticity.omegaX * updraftHorizontalGradient.dVyDx +
      worldHorizontalVorticity.omegaZ * updraftHorizontalGradient.dVyDz,
  );

  return {
    status: vorticityResult.status,
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: vorticityResult.segment,
    tiltingTendency,
    worldHorizontalVorticity,
    updraftHorizontalGradient,
    omegaHMagnitude,
    gradientMagnitude,
    alignment: alignmentFromOperands(
      tiltingTendency,
      omegaHMagnitude,
      gradientMagnitude,
    ),
    provenance: vorticityResult.provenance,
  };
}

/**
 * Support-aware Analysis laboratory tilting diagnostic at world P.
 *
 * Scalar projection of queryAnalysisTiltingExplanationAt.
 * Architecture 61 public contract, Architecture 62 Slice A authority.
 *
 * Does not call DiagnosticTiltingTendency.sample.
 */
export function queryAnalysisTiltingTendencyAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): AnalysisTiltingTendencyResult {
  return projectScalarTendency(
    queryAnalysisTiltingExplanationAt(column, updraft, position, time),
  );
}
