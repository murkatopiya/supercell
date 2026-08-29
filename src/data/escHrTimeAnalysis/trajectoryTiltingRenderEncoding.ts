import type { Vec3 } from "../../core/math/Vec3.js";
import type {
  TrajectoryTiltingProjectedSample,
  TrajectoryTiltingProjection,
} from "./trajectoryTiltingProjection.js";

/**
 * Injected T1 → signed-unit map. Not production color-scale
 * calibration. No production saturation or near-zero band
 * lives on this interface.
 * Result is in [-1, +1]; exact T1 0 maps to 0.
 */
export interface TrajectoryTiltingColorScale {
  readonly version: string;
  signedUnitFromTiltingTendency(tiltingTendency: number): number;
}

export type TrajectoryTiltingNumericSupport =
  | "FULL_SUPPORT"
  | "BOUNDARY_CONDITIONED";

export type TrajectoryTiltingUnsupportedStatus =
  | "OUT_OF_DOMAIN"
  | "COLUMN_UNAVAILABLE";

export type TrajectoryTiltingSampleEncoding =
  | {
      readonly historyIndex: number;
      readonly position: Vec3;
      readonly status: TrajectoryTiltingNumericSupport;
      readonly tiltingTendency: number;
      readonly signedUnit: number;
    }
  | {
      readonly historyIndex: number;
      readonly position: Vec3;
      readonly status: TrajectoryTiltingUnsupportedStatus;
    };

/**
 * Connector between consecutive recorded samples that both have
 * numeric Analysis T1. Color is SAMPLE-ASSOCIATED with the earlier
 * endpoint (ownerHistoryIndex). Both visual vertices use that
 * owner's signedUnit. Not T1 along the interval.
 */
export type TrajectoryTiltingValueSegmentEncoding = {
  readonly ownerHistoryIndex: number;
  readonly nextHistoryIndex: number;
  readonly from: Vec3;
  readonly to: Vec3;
  readonly signedUnit: number;
  readonly support: TrajectoryTiltingNumericSupport;
};

export type TrajectoryTiltingRenderEncoding = {
  readonly samples: readonly TrajectoryTiltingSampleEncoding[];
  readonly valueSegments: readonly TrajectoryTiltingValueSegmentEncoding[];
};

function copyVec3(position: Vec3): Vec3 {
  return { x: position.x, y: position.y, z: position.z };
}

function encodeSample(
  sample: TrajectoryTiltingProjectedSample,
  scale: TrajectoryTiltingColorScale,
): TrajectoryTiltingSampleEncoding {
  const position = copyVec3(sample.position);
  const analysis = sample.analysis;
  if (
    analysis.status === "OUT_OF_DOMAIN" ||
    analysis.status === "COLUMN_UNAVAILABLE"
  ) {
    return {
      historyIndex: sample.historyIndex,
      position,
      status: analysis.status,
    };
  }
  return {
    historyIndex: sample.historyIndex,
    position,
    status: analysis.status,
    tiltingTendency: analysis.tiltingTendency,
    signedUnit: scale.signedUnitFromTiltingTendency(analysis.tiltingTendency),
  };
}

/**
 * Pure renderer encoding of a TrajectoryTiltingProjection.
 * Does not query Analysis physics. Does not invent a production scale.
 * Architecture 62 Slice C.
 */
export function encodeTrajectoryTiltingForRender(
  projection: TrajectoryTiltingProjection,
  scale: TrajectoryTiltingColorScale,
): TrajectoryTiltingRenderEncoding {
  const samples = projection.map((sample) => encodeSample(sample, scale));
  const valueSegments: TrajectoryTiltingValueSegmentEncoding[] = [];

  for (let i = 0; i < samples.length - 1; i++) {
    const owner = samples[i]!;
    const next = samples[i + 1]!;
    if (
      (owner.status !== "FULL_SUPPORT" &&
        owner.status !== "BOUNDARY_CONDITIONED") ||
      (next.status !== "FULL_SUPPORT" &&
        next.status !== "BOUNDARY_CONDITIONED")
    ) {
      continue;
    }
    valueSegments.push({
      ownerHistoryIndex: owner.historyIndex,
      nextHistoryIndex: next.historyIndex,
      from: copyVec3(owner.position),
      to: copyVec3(next.position),
      signedUnit: owner.signedUnit,
      support: owner.status,
    });
  }

  return { samples, valueSegments };
}
