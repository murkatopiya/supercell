import type { Vec3 } from "../../core/math/Vec3.js";
import type { AnalysisNativeContainingSegment } from "./analysisQuery.js";
import type {
  AnalysisTiltingAlignment,
  AnalysisTiltingExplanationResult,
} from "./analysisTiltingQuery.js";
import type { EscHrTimeAnalysisProvenance } from "./types.js";

type SupportedExplanation = Extract<
  AnalysisTiltingExplanationResult,
  { status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" }
>;

type OutOfDomainExplanation = Extract<
  AnalysisTiltingExplanationResult,
  { status: "OUT_OF_DOMAIN" }
>;

/**
 * Injected physical-magnitude → world-space display-length map.
 * Both operands have units s⁻¹, so they share this mapping.
 * Exact physical 0 maps to display length 0.
 *
 * Not a production freeze of glyph exaggeration
 * (Architecture 62 §23 item 4 remains OPEN).
 * Not physics. Not per-vector normalization.
 */
export interface TrajectoryTiltingGlyphVectorDisplayScale {
  readonly version: string;
  /**
   * Physical magnitude [s⁻¹] → world-space arrow length [m].
   * Same function for environmental ω_h and prescribed ∇_h Vy.
   */
  worldLengthFromPhysicalMagnitude(magnitudeSMinus1: number): number;
}

export type TrajectoryTiltingGlyphNumericSupport =
  | "FULL_SUPPORT"
  | "BOUNDARY_CONDITIONED";

export type TrajectoryTiltingGlyphUnsupportedStatus =
  | "OUT_OF_DOMAIN"
  | "COLUMN_UNAVAILABLE";

/**
 * World-horizontal operand packaged from the atomic explanation.
 * vectorWorld is (vx, 0, vz) on the project triad: +X East, +Z South.
 * Magnitude is the atomic explanation's |v|, not recomputed here.
 * A zero magnitude has no direction: do not treat (0,0,0) as a unit axis.
 */
export type TrajectoryTiltingGlyphOperand = {
  readonly vectorWorld: Vec3;
  readonly magnitude: number;
};

export type TrajectoryTiltingGlyphSupportedModel = {
  readonly kind: "SUPPORTED";
  /**
   * Recorded world position occupied by the selected sample P_i.
   * Shared visual origin is a visualization convention only.
   * These vectors are Eulerian field operands at that location /
   * altitude, not vorticity belonging to the tracer.
   */
  readonly anchor: Vec3;
  readonly support: TrajectoryTiltingGlyphNumericSupport;
  readonly representation: SupportedExplanation["representation"];
  readonly method: SupportedExplanation["method"];
  readonly physicalIdentity: SupportedExplanation["physicalIdentity"];
  readonly environmentalOperand: SupportedExplanation["environmentalOperand"];
  readonly stormLocalOperand: SupportedExplanation["stormLocalOperand"];
  readonly segment: AnalysisNativeContainingSegment;
  readonly provenance: EscHrTimeAnalysisProvenance;
  readonly omega: TrajectoryTiltingGlyphOperand;
  readonly gradient: TrajectoryTiltingGlyphOperand;
  readonly alignment: AnalysisTiltingAlignment;
};

export type TrajectoryTiltingGlyphUnsupportedModel =
  | {
      readonly kind: "UNSUPPORTED";
      readonly status: "COLUMN_UNAVAILABLE";
    }
  | {
      readonly kind: "UNSUPPORTED";
      readonly status: "OUT_OF_DOMAIN";
      readonly representation: OutOfDomainExplanation["representation"];
      readonly provenance: EscHrTimeAnalysisProvenance;
    };

export type TrajectoryTiltingGlyphModel =
  | TrajectoryTiltingGlyphSupportedModel
  | TrajectoryTiltingGlyphUnsupportedModel;

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function copyAlignment(
  alignment: AnalysisTiltingAlignment,
): AnalysisTiltingAlignment {
  if (alignment.state === "ALIGNMENT_DEFINED") {
    return {
      state: "ALIGNMENT_DEFINED",
      cosTheta: alignment.cosTheta,
      theta: alignment.theta,
    };
  }
  return { state: alignment.state };
}

/**
 * Package an atomic Analysis tilting explanation as a glyph model.
 * Does not recompute ω_h, ∇_h Vy, T1, magnitudes, cos θ, or θ.
 *
 * `position` is the recorded sample location P_i that anchors the
 * glyph. It is not a second history identity and is not interpolated.
 *
 * Architecture 62 Slice D.
 */
export function createTrajectoryTiltingGlyphModel(
  position: Vec3,
  explanation: AnalysisTiltingExplanationResult,
): TrajectoryTiltingGlyphModel {
  if (explanation.status === "COLUMN_UNAVAILABLE") {
    return { kind: "UNSUPPORTED", status: "COLUMN_UNAVAILABLE" };
  }
  if (explanation.status === "OUT_OF_DOMAIN") {
    return {
      kind: "UNSUPPORTED",
      status: "OUT_OF_DOMAIN",
      representation: explanation.representation,
      provenance: explanation.provenance,
    };
  }

  return {
    kind: "SUPPORTED",
    anchor: copyVec3(position),
    support: explanation.status,
    representation: explanation.representation,
    method: explanation.method,
    physicalIdentity: explanation.physicalIdentity,
    environmentalOperand: explanation.environmentalOperand,
    stormLocalOperand: explanation.stormLocalOperand,
    segment: {
      hLo: explanation.segment.hLo,
      hHi: explanation.segment.hHi,
    },
    provenance: explanation.provenance,
    omega: {
      vectorWorld: {
        x: explanation.worldHorizontalVorticity.omegaX,
        y: 0,
        z: explanation.worldHorizontalVorticity.omegaZ,
      },
      magnitude: explanation.omegaHMagnitude,
    },
    gradient: {
      vectorWorld: {
        x: explanation.updraftHorizontalGradient.dVyDx,
        y: 0,
        z: explanation.updraftHorizontalGradient.dVyDz,
      },
      magnitude: explanation.gradientMagnitude,
    },
    alignment: copyAlignment(explanation.alignment),
  };
}

/**
 * Physical magnitude [s⁻¹] → display length [m] under an injected scale.
 * Exact physical 0 is display 0 even if a scale would invent a length.
 * Negative mapped lengths are not a second sign encoding: they yield 0.
 */
export function displayLengthFromPhysicalMagnitude(
  magnitudeSMinus1: number,
  scale: TrajectoryTiltingGlyphVectorDisplayScale,
): number {
  if (magnitudeSMinus1 === 0) {
    return 0;
  }
  const mapped = scale.worldLengthFromPhysicalMagnitude(magnitudeSMinus1);
  if (!(mapped > 0)) {
    return 0;
  }
  return mapped;
}

/**
 * Display displacement along the physical world vector.
 * Null means no direction: exact-zero physical magnitude.
 * A zero-length displacement (non-null) means the scale mapped a
 * nonzero magnitude to no visible length; still not an invented axis.
 */
export function displayDisplacementFromWorldVector(
  vectorWorld: Vec3,
  magnitude: number,
  scale: TrajectoryTiltingGlyphVectorDisplayScale,
): Vec3 | null {
  if (magnitude === 0) {
    return null;
  }
  const length = displayLengthFromPhysicalMagnitude(magnitude, scale);
  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  const factor = length / magnitude;
  return {
    x: vectorWorld.x * factor,
    y: 0,
    z: vectorWorld.z * factor,
  };
}
