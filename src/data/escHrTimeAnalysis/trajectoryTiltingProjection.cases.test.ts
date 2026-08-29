import { describe, expect, it } from "vitest";
import { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import goshenGoldenJson from "../eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json";
import goshenTimeJson from "../eolNsslMgausEsc/fixtures/nssl1Goshen2155.retained-time.json";
import prospectGoldenJson from "../eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json";
import prospectTimeJson from "../eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.retained-time.json";
import nssl2DumasGoldenJson from "../eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json";
import nssl2DumasTimeJson from "../eolNsslMgausEsc/fixtures/nssl2Dumas215218.retained-time.json";
import {
  NSSL1_GOSHEN_2155_SPEC,
  NSSL1_PROSPECT_VALLEY_222346_SPEC,
  NSSL2_DUMAS_215218_SPEC,
} from "../eolNsslMgausEsc/escObservedSoundingSpec.js";
import type { EscNormalizedGolden } from "../eolNsslMgausEsc/types.js";
import { queryAnalysisTiltingExplanationAt } from "./analysisTiltingQuery.js";
import { ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import { projectAnalysisTiltingAlongRecordedPath } from "./trajectoryTiltingProjection.js";
import type {
  AnalysisSupportState,
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisInputSample,
} from "./types.js";

interface RetainedTimeGolden {
  times: number[];
}

const CASES = [
  {
    id: "goshen",
    spec: NSSL1_GOSHEN_2155_SPEC,
    golden: goshenGoldenJson as EscNormalizedGolden,
    times: (goshenTimeJson as RetainedTimeGolden).times,
  },
  {
    id: "prospect",
    spec: NSSL1_PROSPECT_VALLEY_222346_SPEC,
    golden: prospectGoldenJson as EscNormalizedGolden,
    times: (prospectTimeJson as RetainedTimeGolden).times,
  },
  {
    id: "dumas",
    spec: NSSL2_DUMAS_215218_SPEC,
    golden: nssl2DumasGoldenJson as EscNormalizedGolden,
    times: (nssl2DumasTimeJson as RetainedTimeGolden).times,
  },
] as const;

function zipSamples(
  golden: EscNormalizedGolden,
  times: readonly number[],
): EscHrTimeAnalysisInputSample[] {
  return golden.levels.map((level, index) => ({
    time: times[index]!,
    height: level.height,
    eastward: level.eastward,
    northward: level.northward,
  }));
}

function firstFullFullIndex(support: readonly AnalysisSupportState[]): number {
  for (let i = 0; i < support.length - 1; i++) {
    if (
      support[i] === "FULL_SUPPORT" &&
      support[i + 1] === "FULL_SUPPORT"
    ) {
      return i;
    }
  }
  throw new Error("no FULL–FULL segment");
}

function loadColumn(spec: (typeof CASES)[number]): EscHrTimeAnalysisColumn {
  return createEscHrTimeAnalysis({
    samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
    sourceIdentity: spec.spec.sourceIdentity,
    samples: zipSamples(spec.golden, spec.times),
  });
}

function prescribedUpdraft(): VerticalEnvelopeUpdraftField {
  return new VerticalEnvelopeUpdraftField({
    centerX: 0,
    centerZ: 0,
    peakVerticalVelocity: 30,
    sigma: 4000,
    baseHeight: 0,
    topHeight: 12000,
  });
}

describe("Analysis tilting projection on production ESC columns", () => {
  it.each(CASES)(
    "$id FULL / BOUNDARY / OOD path samples match the atomic explanation",
    (spec) => {
      const column = loadColumn(spec);
      const updraft = prescribedUpdraft();
      const heights = column.profile.levelHeights();
      const firstFF = firstFullFullIndex(column.support);
      const fullHeight = (heights[firstFF]! + heights[firstFF + 1]!) / 2;
      const boundaryHeight = (heights[0]! + heights[1]!) / 2;
      const recorded = [
        { position: { x: 800, y: fullHeight, z: 400 }, simulationTime: 10 },
        {
          position: { x: 800, y: boundaryHeight, z: 400 },
          simulationTime: 20,
        },
        {
          position: { x: 800, y: column.profile.minHeight - 10, z: 400 },
          simulationTime: 30,
        },
      ];

      const projection = projectAnalysisTiltingAlongRecordedPath(
        recorded,
        column,
        updraft,
      );
      expect(projection).toHaveLength(3);
      expect(projection.map((sample) => sample.analysis.status)).toEqual([
        "FULL_SUPPORT",
        "BOUNDARY_CONDITIONED",
        "OUT_OF_DOMAIN",
      ]);

      for (let i = 0; i < recorded.length; i++) {
        const direct = queryAnalysisTiltingExplanationAt(
          column,
          updraft,
          recorded[i]!.position,
          recorded[i]!.simulationTime,
        );
        const projected = projection[i]!.analysis;
        expect(projection[i]!.historyIndex).toBe(i);
        expect(projected.status).toBe(direct.status);
        if (
          projected.status === "FULL_SUPPORT" ||
          projected.status === "BOUNDARY_CONDITIONED"
        ) {
          if (
            direct.status !== "FULL_SUPPORT" &&
            direct.status !== "BOUNDARY_CONDITIONED"
          ) {
            throw new Error(`${spec.id}: expected numeric explanation`);
          }
          expect(projected.tiltingTendency).toBe(direct.tiltingTendency);
        } else {
          expect("tiltingTendency" in projected).toBe(false);
        }
      }
    },
  );
});
