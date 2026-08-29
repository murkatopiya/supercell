import { T1_COLOR_SCALE_V1 } from "../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import {
  encodeTrajectoryTiltingForRender,
  type TrajectoryTiltingRenderEncoding,
} from "../data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.js";
import {
  projectAnalysisTiltingAlongRecordedPath,
  projectAnalysisTiltingSampleAt,
  type AnalysisTiltingExplanationQuery,
  type TrajectoryTiltingProjectedSample,
} from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import { queryAnalysisTiltingExplanationAt } from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import type { EscHrTimeAnalysisColumn } from "../data/escHrTimeAnalysis/types.js";
import type { VerticalEnvelopeUpdraftField } from "../physics/storm/VerticalEnvelopeUpdraftField.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";

type LaneCache = {
  prefixGeneration: number;
  samples: TrajectoryTiltingProjectedSample[];
};

/**
 * Derived per-lane Analysis trajectory projection cache.
 * PathHistory remains the recorded store. Cache is observe-time only.
 *
 * Append-only continuation (same lanePrefixGeneration, longer count)
 * queries only the new samples. Clear / shrink / column / updraft
 * replacement rebuilds from the atomic full projection.
 */
export class ExploreAnalysisTiltingProjectionCache {
  private column: EscHrTimeAnalysisColumn | null = null;
  private updraft: VerticalEnvelopeUpdraftField | null = null;
  private lanes: LaneCache[] = [];

  constructor(
    private readonly query: AnalysisTiltingExplanationQuery = queryAnalysisTiltingExplanationAt,
  ) {}

  reset(): void {
    this.column = null;
    this.updraft = null;
    this.lanes = [];
  }

  projectedLane(index: number): readonly TrajectoryTiltingProjectedSample[] | undefined {
    return this.lanes[index]?.samples;
  }

  encodeForPathHistory(
    pathHistory: TracerPathHistory,
    analysisColumn: EscHrTimeAnalysisColumn | null | undefined,
    updraft: VerticalEnvelopeUpdraftField,
  ): TrajectoryTiltingRenderEncoding[] | null {
    if (analysisColumn == null) {
      this.reset();
      return null;
    }
    if (this.column !== analysisColumn || this.updraft !== updraft) {
      this.column = analysisColumn;
      this.updraft = updraft;
      this.lanes = [];
    }
    while (this.lanes.length > pathHistory.tracerCount) {
      this.lanes.pop();
    }
    const encodings: TrajectoryTiltingRenderEncoding[] = [];
    for (let slotIndex = 0; slotIndex < pathHistory.tracerCount; slotIndex++) {
      encodings.push(
        encodeTrajectoryTiltingForRender(
          this.syncLane(pathHistory, slotIndex, analysisColumn, updraft),
          T1_COLOR_SCALE_V1,
        ),
      );
    }
    return encodings;
  }

  private syncLane(
    pathHistory: TracerPathHistory,
    slotIndex: number,
    column: EscHrTimeAnalysisColumn,
    updraft: VerticalEnvelopeUpdraftField,
  ): readonly TrajectoryTiltingProjectedSample[] {
    const count = pathHistory.sampleCountFor(slotIndex);
    const generation = pathHistory.lanePrefixGeneration(slotIndex);
    const cached = this.lanes[slotIndex];
    if (
      cached === undefined ||
      cached.prefixGeneration !== generation ||
      count < cached.samples.length
    ) {
      const recorded = [];
      for (let historyIndex = 0; historyIndex < count; historyIndex++) {
        recorded.push(pathHistory.sampleAt(slotIndex, historyIndex));
      }
      const projected = projectAnalysisTiltingAlongRecordedPath(
        recorded,
        column,
        updraft,
        this.query,
      );
      this.lanes[slotIndex] = {
        prefixGeneration: generation,
        samples: [...projected],
      };
      return this.lanes[slotIndex]!.samples;
    }
    for (
      let historyIndex = cached.samples.length;
      historyIndex < count;
      historyIndex++
    ) {
      cached.samples.push(
        projectAnalysisTiltingSampleAt(
          pathHistory.sampleAt(slotIndex, historyIndex),
          historyIndex,
          column,
          updraft,
          this.query,
        ),
      );
    }
    return cached.samples;
  }
}
