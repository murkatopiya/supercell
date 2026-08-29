import type { Vec3 } from "../../core/math/Vec3.js";
import { worldHorizontalVorticityFromAtmospheric } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import type { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
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

export type AnalysisTiltingTendencyResult =
  | {
      readonly status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
      readonly representation: typeof ANALYSIS_QUERY_REPRESENTATION;
      readonly method: typeof NATIVE_CONTAINING_SEGMENT_METHOD;
      readonly physicalIdentity: typeof ANALYSIS_TILTING_PHYSICAL_IDENTITY;
      readonly environmentalOperand: typeof ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND;
      readonly stormLocalOperand: typeof ANALYSIS_TILTING_STORM_LOCAL_OPERAND;
      readonly segment: AnalysisNativeContainingSegment;
      /** Signed T_tilt,y. Units: s⁻². */
      readonly tiltingTendency: number;
      readonly provenance: EscHrTimeAnalysisProvenance;
    }
  | AnalysisOutOfDomainResult
  | AnalysisColumnUnavailableResult;

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new EscAnalysisError(`${label} must be finite`);
  }
}

/**
 * Support-aware Analysis laboratory tilting diagnostic at world P.
 *
 * T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z  [s⁻²]
 *
 * Environmental ω_h comes from queryAnalysisNativeSegmentVorticityAt.
 * ∇_h Vy is the prescribed VerticalEnvelopeUpdraftField analytic gradient.
 * FULL_SUPPORT is Analysis diagnostic support of that environmental
 * operand, not observational supercell tilting.
 *
 * Does not call DiagnosticTiltingTendency.sample.
 * Architecture 61.
 */
export function queryAnalysisTiltingTendencyAt(
  column: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): AnalysisTiltingTendencyResult {
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
  const tiltingTendency =
    world.omegaX * gradient.dVyDx + world.omegaZ * gradient.dVyDz;

  return {
    status: vorticityResult.status,
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: vorticityResult.segment,
    tiltingTendency: tiltingTendency === 0 ? 0 : tiltingTendency,
    provenance: vorticityResult.provenance,
  };
}
