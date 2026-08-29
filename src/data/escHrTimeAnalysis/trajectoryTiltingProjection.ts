import type { Vec3 } from "../../core/math/Vec3.js";
import type { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import {
  queryAnalysisTiltingExplanationAt,
  type AnalysisTiltingExplanationResult,
  type AnalysisTiltingTendencyResult,
} from "./analysisTiltingQuery.js";
import type { EscHrTimeAnalysisColumn } from "./types.js";

/**
 * Recorded path-sample identity consumed by the projection.
 * Structural PathHistorySample: { position, simulationTime }.
 * This module does not import Simulation and does not own history.
 */
export type TrajectoryTiltingRecordedSample = {
  readonly position: Vec3;
  readonly simulationTime: number;
};

/**
 * One derived Analysis T1 sample along a recorded path.
 * historyIndex is the local recorded-sample index, not a new
 * scientific identity. Architecture 62 Slice B.
 */
export type TrajectoryTiltingProjectedSample = {
  readonly historyIndex: number;
  readonly position: Vec3;
  readonly simulationTime: number;
  readonly analysis: AnalysisTiltingTendencyResult;
};

/**
 * Ordered per-recorded-sample Analysis diagnostic states.
 * Discrete samples only: not a continuous supported interval.
 */
export type TrajectoryTiltingProjection =
  readonly TrajectoryTiltingProjectedSample[];

function copyVec3(position: Vec3): Vec3 {
  return { x: position.x, y: position.y, z: position.z };
}

function trailAnalysisFromExplanation(
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
 * Analysis T1 sampled at exact recorded trajectory samples.
 *
 * Derived observe-time diagnostic beside recorded path history.
 * Does not persist onto PathHistorySample, does not interpolate
 * between samples, and does not treat Analysis as the advection
 * field that recorded the path. Architecture 62 Slice B.
 */
export function projectAnalysisTiltingAlongRecordedPath(
  recordedSamples: readonly TrajectoryTiltingRecordedSample[],
  column: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
): TrajectoryTiltingProjection {
  const projected: TrajectoryTiltingProjectedSample[] = [];

  for (let historyIndex = 0; historyIndex < recordedSamples.length; historyIndex++) {
    const recorded = recordedSamples[historyIndex]!;
    const explanation = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      recorded.position,
      recorded.simulationTime,
    );
    projected.push({
      historyIndex,
      position: copyVec3(recorded.position),
      simulationTime: recorded.simulationTime,
      analysis: trailAnalysisFromExplanation(explanation),
    });
  }

  return projected;
}
