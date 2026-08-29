import { T1_COLOR_SCALE_V1 } from "../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import {
  encodeTrajectoryTiltingForRender,
  type TrajectoryTiltingRenderEncoding,
} from "../data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.js";
import { projectAnalysisTiltingAlongRecordedPath } from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import type { EscHrTimeAnalysisColumn } from "../data/escHrTimeAnalysis/types.js";
import type { VerticalEnvelopeUpdraftField } from "../physics/storm/VerticalEnvelopeUpdraftField.js";
import type {
  PathHistorySample,
  TracerPathHistory,
} from "../simulation/TracerPathHistory.js";

const EMPTY_ENCODING: TrajectoryTiltingRenderEncoding = {
  samples: [],
  valueSegments: [],
};

/**
 * Slice B + Slice C + CAL V1 for one recorded occupancy lane.
 * Null column is COLUMN_UNAVAILABLE: no overlay geometry, no Source T1.
 * Does not persist T1 onto PathHistorySample.
 */
export function encodeExploreAnalysisTiltingAlongHistory(
  recordedSamples: readonly PathHistorySample[],
  analysisColumn: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
): TrajectoryTiltingRenderEncoding {
  if (analysisColumn == null || recordedSamples.length === 0) {
    return EMPTY_ENCODING;
  }
  const projection = projectAnalysisTiltingAlongRecordedPath(
    recordedSamples,
    analysisColumn,
    updraft,
  );
  return encodeTrajectoryTiltingForRender(projection, T1_COLOR_SCALE_V1);
}

/**
 * One encoding per occupancy lane, or null when Analysis is unavailable.
 * Null means hide the overlay; it is not a zero-T1 encoding.
 */
export function encodeExploreAnalysisTiltingForPathHistory(
  pathHistory: TracerPathHistory,
  analysisColumn: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
): TrajectoryTiltingRenderEncoding[] | null {
  if (analysisColumn == null) {
    return null;
  }
  const encodings: TrajectoryTiltingRenderEncoding[] = [];
  for (let slotIndex = 0; slotIndex < pathHistory.tracerCount; slotIndex++) {
    encodings.push(
      encodeExploreAnalysisTiltingAlongHistory(
        pathHistory.samplesFor(slotIndex),
        analysisColumn,
        updraft,
      ),
    );
  }
  return encodings;
}

/**
 * Column identity + PathHistory.revision.
 * Not sample-count / last-time, which can collide after replacement.
 */
export function exploreAnalysisTiltingHistoryFingerprint(
  pathHistory: TracerPathHistory,
  analysisColumn: EscHrTimeAnalysisColumn | null | undefined,
): string {
  if (analysisColumn == null) {
    return "column-unavailable";
  }
  return `${analysisColumn.provenance.sourceIdentity}|${pathHistory.revision}`;
}
