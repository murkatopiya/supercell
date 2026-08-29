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
 * Exact recorded sample used for the Analysis lookup.
 * Not a second history identity and not the native height segment.
 */
export type TrajectoryTiltingRecordedSampleContext = {
  readonly position: Vec3;
  readonly simulationTime: number;
};

export type TrajectoryTiltingVerificationNumericSupport =
  | "FULL_SUPPORT"
  | "BOUNDARY_CONDITIONED";

export type TrajectoryTiltingVerificationSupportedModel = {
  readonly kind: "SUPPORTED";
  readonly support: TrajectoryTiltingVerificationNumericSupport;
  readonly representation: SupportedExplanation["representation"];
  readonly method: SupportedExplanation["method"];
  readonly physicalIdentity: SupportedExplanation["physicalIdentity"];
  readonly environmentalOperand: SupportedExplanation["environmentalOperand"];
  readonly stormLocalOperand: SupportedExplanation["stormLocalOperand"];
  /** Signed T_tilt,y. Units: s⁻². Copied from the atomic explanation. */
  readonly tiltingTendency: number;
  /** |ω_h,env|. Units: s⁻¹. Copied, not recomputed. */
  readonly omegaHMagnitude: number;
  /** |∇_h Vy,updraft|. Units: s⁻¹. Copied, not recomputed. */
  readonly gradientMagnitude: number;
  readonly alignment: AnalysisTiltingAlignment;
  /**
   * Native containing height segment of the environmental Analysis
   * derivative. Not a trajectory / material / time interval.
   */
  readonly segment: AnalysisNativeContainingSegment;
  readonly provenance: EscHrTimeAnalysisProvenance;
  readonly recordedSample?: TrajectoryTiltingRecordedSampleContext;
};

export type TrajectoryTiltingVerificationUnsupportedModel =
  | {
      readonly kind: "UNSUPPORTED";
      readonly status: "COLUMN_UNAVAILABLE";
      readonly recordedSample?: TrajectoryTiltingRecordedSampleContext;
    }
  | {
      readonly kind: "UNSUPPORTED";
      readonly status: "OUT_OF_DOMAIN";
      readonly representation: OutOfDomainExplanation["representation"];
      readonly provenance: EscHrTimeAnalysisProvenance;
      readonly recordedSample?: TrajectoryTiltingRecordedSampleContext;
    };

export type TrajectoryTiltingVerificationModel =
  | TrajectoryTiltingVerificationSupportedModel
  | TrajectoryTiltingVerificationUnsupportedModel;

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function copyRecordedSample(
  recordedSample: TrajectoryTiltingRecordedSampleContext | undefined,
): TrajectoryTiltingRecordedSampleContext | undefined {
  if (recordedSample === undefined) {
    return undefined;
  }
  return {
    position: copyVec3(recordedSample.position),
    simulationTime: recordedSample.simulationTime,
  };
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

function withRecordedSample<T extends object>(
  model: T,
  recordedSample: TrajectoryTiltingRecordedSampleContext | undefined,
): T {
  const copied = copyRecordedSample(recordedSample);
  if (copied === undefined) {
    return model;
  }
  return { ...model, recordedSample: copied };
}

/**
 * Package an atomic Analysis tilting explanation as a numeric
 * verification model. Does not recompute T1, magnitudes, cos θ, or θ.
 *
 * Optional `recordedSample` is the exact (P_i, t_i) used for the lookup.
 * It is not a laboratory clock and not ESC measurement TIME.
 *
 * Architecture 62 Slice E.
 */
export function createTrajectoryTiltingVerificationModel(
  explanation: AnalysisTiltingExplanationResult,
  recordedSample?: TrajectoryTiltingRecordedSampleContext,
): TrajectoryTiltingVerificationModel {
  if (explanation.status === "COLUMN_UNAVAILABLE") {
    return withRecordedSample(
      { kind: "UNSUPPORTED", status: "COLUMN_UNAVAILABLE" },
      recordedSample,
    );
  }
  if (explanation.status === "OUT_OF_DOMAIN") {
    return withRecordedSample(
      {
        kind: "UNSUPPORTED" as const,
        status: "OUT_OF_DOMAIN" as const,
        representation: explanation.representation,
        provenance: explanation.provenance,
      },
      recordedSample,
    );
  }

  return withRecordedSample(
    {
      kind: "SUPPORTED" as const,
      support: explanation.status,
      representation: explanation.representation,
      method: explanation.method,
      physicalIdentity: explanation.physicalIdentity,
      environmentalOperand: explanation.environmentalOperand,
      stormLocalOperand: explanation.stormLocalOperand,
      tiltingTendency: explanation.tiltingTendency,
      omegaHMagnitude: explanation.omegaHMagnitude,
      gradientMagnitude: explanation.gradientMagnitude,
      alignment: copyAlignment(explanation.alignment),
      segment: {
        hLo: explanation.segment.hLo,
        hHi: explanation.segment.hHi,
      },
      provenance: explanation.provenance,
    },
    recordedSample,
  );
}
