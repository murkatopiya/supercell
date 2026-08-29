import { describe, expect, it } from "vitest";
import { createExploreLab } from "../app/createExploreLab.js";
import {
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "./exploreEnvironmentIdentity.js";
import type { ExploreSceneSlots } from "./ExplorePointReleaseOrchestration.js";
import { ExploreAnalysisTiltingProjectionCache } from "./exploreAnalysisTiltingProjectionCache.js";
import {
  projectAnalysisTiltingAlongRecordedPath,
  type AnalysisTiltingExplanationQuery,
} from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import { queryAnalysisTiltingExplanationAt } from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import type { PathHistorySample } from "../simulation/TracerPathHistory.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import cacheSrc from "./exploreAnalysisTiltingProjectionCache.ts?raw";
import pathHistorySrc from "../simulation/TracerPathHistory.ts?raw";
import overlaySrc from "../rendering/trajectoryTiltingOverlay.ts?raw";

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    removeLastTracerSlot() {
      if (tracerSlotCount > 0) {
        tracerSlotCount -= 1;
      }
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

function particle(sample: PathHistorySample): TracerAdvectionState {
  return {
    position: sample.position,
    age: sample.simulationTime,
    active: true,
  };
}

function recordPath(
  history: TracerPathHistory,
  samples: readonly PathHistorySample[],
): void {
  const first = samples[0]!;
  history.captureInitial([particle(first)], first.simulationTime);
  for (let i = 1; i < samples.length; i++) {
    const sample = samples[i]!;
    history.recordAfterStep([particle(sample)], sample.simulationTime);
  }
}

function countingQuery(state: { count: number }): AnalysisTiltingExplanationQuery {
  return (column, updraft, position, time) => {
    state.count += 1;
    return queryAnalysisTiltingExplanationAt(column, updraft, position, time);
  };
}

function expectProjectedEqual(
  actual: readonly { historyIndex: number; position: unknown; simulationTime: number; analysis: unknown; explanation?: unknown }[],
  expected: readonly { historyIndex: number; position: unknown; simulationTime: number; analysis: unknown; explanation?: unknown }[],
): void {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]!.historyIndex).toBe(expected[i]!.historyIndex);
    expect(actual[i]!.position).toEqual(expected[i]!.position);
    expect(actual[i]!.simulationTime).toBe(expected[i]!.simulationTime);
    expect(actual[i]!.analysis).toEqual(expected[i]!.analysis);
    expect(actual[i]!.explanation).toEqual(expected[i]!.explanation);
  }
}

const INTERIOR: PathHistorySample[] = [
  { position: { x: -2000, y: 2000, z: 0 }, simulationTime: 0 },
  { position: { x: -1990, y: 2010, z: 10 }, simulationTime: 0.1 },
  { position: { x: -1980, y: 2020, z: 20 }, simulationTime: 0.2 },
];

const PATH_B: PathHistorySample[] = [
  { position: { x: 2000, y: 2000, z: 0 }, simulationTime: 0 },
  { position: { x: 2010, y: 2010, z: 10 }, simulationTime: 0.1 },
  { position: { x: 2020, y: 2020, z: 20 }, simulationTime: 0.2 },
];

const OOD_THEN_FULL: PathHistorySample[] = [
  { position: { x: 0, y: 2000, z: 0 }, simulationTime: 0 },
  { position: { x: 10, y: 2010, z: 0 }, simulationTime: 0.1 },
  { position: { x: 20, y: -50, z: 0 }, simulationTime: 0.2 },
  { position: { x: 30, y: -60, z: 0 }, simulationTime: 0.3 },
  { position: { x: 40, y: 2000, z: 0 }, simulationTime: 0.4 },
  { position: { x: 50, y: 2010, z: 0 }, simulationTime: 0.5 },
];

describe("ExploreAnalysisTiltingProjectionCache", () => {
  it("matches a full recompute after sequential appends and queries once per sample", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const queries = { count: 0 };
    const cache = new ExploreAnalysisTiltingProjectionCache(countingQuery(queries));
    const history = new TracerPathHistory(1);

    history.captureInitial([particle(INTERIOR[0]!)], INTERIOR[0]!.simulationTime);
    cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    expect(queries.count).toBe(1);

    history.recordAfterStep([particle(INTERIOR[1]!)], INTERIOR[1]!.simulationTime);
    const afterSecond = cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(queries.count).toBe(2);

    const firstProjected = cache.projectedLane(0)![0];
    history.recordAfterStep([particle(INTERIOR[2]!)], INTERIOR[2]!.simulationTime);
    const encodings = cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(queries.count).toBe(3);
    expect(cache.projectedLane(0)![0]).toBe(firstProjected);

    const full = projectAnalysisTiltingAlongRecordedPath(
      INTERIOR,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    expectProjectedEqual(cache.projectedLane(0)!, full);
    expect(encodings[0]!.valueSegments).toHaveLength(2);
    expect(encodings[0]!.valueSegments[1]!.ownerHistoryIndex).toBe(1);
    expect(afterSecond[0]!.valueSegments[0]!.ownerHistoryIndex).toBe(0);
  });

  it("does not invent a segment across OOD and restores the first legal re-entry", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const queries = { count: 0 };
    const cache = new ExploreAnalysisTiltingProjectionCache(countingQuery(queries));
    const history = new TracerPathHistory(1);
    history.captureInitial([particle(OOD_THEN_FULL[0]!)], 0);
    for (let i = 1; i < OOD_THEN_FULL.length; i++) {
      cache.encodeForPathHistory(
        history,
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
      );
      history.recordAfterStep(
        [particle(OOD_THEN_FULL[i]!)],
        OOD_THEN_FULL[i]!.simulationTime,
      );
    }
    const encodings = cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(queries.count).toBe(OOD_THEN_FULL.length);
    const full = projectAnalysisTiltingAlongRecordedPath(
      OOD_THEN_FULL,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    expectProjectedEqual(cache.projectedLane(0)!, full);
    expect(
      encodings[0]!.valueSegments.some(
        (segment) => segment.ownerHistoryIndex === 1 && segment.nextHistoryIndex === 2,
      ),
    ).toBe(false);
    const reentry = encodings[0]!.valueSegments.find(
      (segment) => segment.ownerHistoryIndex === 4,
    );
    expect(reentry).toBeDefined();
    expect(reentry!.nextHistoryIndex).toBe(5);
  });

  it("rebuilds after clear and after same-N/last-time replacement", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const queries = { count: 0 };
    const cache = new ExploreAnalysisTiltingProjectionCache(countingQuery(queries));
    const history = new TracerPathHistory(1);
    recordPath(history, INTERIOR);
    cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    expect(queries.count).toBe(3);

    history.clear();
    const cleared = cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(cleared[0]!.samples).toEqual([]);
    expect(queries.count).toBe(3);

    recordPath(history, PATH_B);
    const replaced = cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(queries.count).toBe(6);
    expect(replaced[0]!.samples[0]!.position).toEqual(PATH_B[0]!.position);
    const fullB = projectAnalysisTiltingAlongRecordedPath(
      PATH_B,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    expectProjectedEqual(cache.projectedLane(0)!, fullB);
  });

  it("discards cache on Analysis column change and does no work when the column is null", () => {
    const goshen = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const prospect = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const moore = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const queries = { count: 0 };
    const cache = new ExploreAnalysisTiltingProjectionCache(countingQuery(queries));
    const history = new TracerPathHistory(1);
    recordPath(history, INTERIOR);

    const goshenEnc = cache.encodeForPathHistory(
      history,
      goshen.analysisColumn,
      goshen.tiltingTendency.updraft,
    )!;
    expect(queries.count).toBe(3);
    const prospectEnc = cache.encodeForPathHistory(
      history,
      prospect.analysisColumn,
      prospect.tiltingTendency.updraft,
    )!;
    expect(queries.count).toBe(6);
    expect(goshenEnc[0]!.samples[0]).not.toEqual(prospectEnc[0]!.samples[0]);

    expect(
      cache.encodeForPathHistory(
        history,
        moore.analysisColumn,
        moore.tiltingTendency.updraft,
      ),
    ).toBeNull();
    expect(queries.count).toBe(6);
    expect(cache.projectedLane(0)).toBeUndefined();
  });

  it("keeps selected-sample T1 equal to the atomic Analysis query", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const cache = new ExploreAnalysisTiltingProjectionCache();
    const history = new TracerPathHistory(1);
    recordPath(history, INTERIOR);
    cache.encodeForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const cached = cache.projectedLane(0)![0]!;
    const atomic = queryAnalysisTiltingExplanationAt(
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
      INTERIOR[0]!.position,
      INTERIOR[0]!.simulationTime,
    );
    expect(cached.explanation).toEqual(atomic);
    expect(
      atomic.status === "FULL_SUPPORT" || atomic.status === "BOUNDARY_CONDITIONED",
    ).toBe(true);
    if (
      atomic.status !== "FULL_SUPPORT" &&
      atomic.status !== "BOUNDARY_CONDITIONED"
    ) {
      return;
    }
    expect(cached.analysis.status).toBe(atomic.status);
    if (
      cached.analysis.status !== "FULL_SUPPORT" &&
      cached.analysis.status !== "BOUNDARY_CONDITIONED"
    ) {
      return;
    }
    expect(cached.analysis.tiltingTendency).toBe(atomic.tiltingTendency);
    expect(cached.analysis.segment).toEqual(atomic.segment);
    expect(atomic.worldHorizontalVorticity).toBeDefined();
    expect(atomic.updraftHorizontalGradient).toBeDefined();
    expect(atomic.alignment).toBeDefined();
  });

  it("does not store T1 on PathHistory or invent overlay physics", () => {
    expect(pathHistorySrc).not.toMatch(/tiltingTendency/);
    expect(pathHistorySrc).not.toMatch(/analysisColumn/);
    expect(cacheSrc).toMatch(/lanePrefixGeneration/);
    expect(cacheSrc).not.toMatch(/T1_COLOR_SCALE_V1_SATURATION/);
    expect(overlaySrc).not.toMatch(/ExploreAnalysisTiltingProjectionCache/);
  });
});
