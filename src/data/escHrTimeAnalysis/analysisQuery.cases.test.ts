import { describe, expect, it } from "vitest";
import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import { soundingSegmentContainingHeight } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { horizontalVorticityFromShear } from "../../physics/environment/horizontalVorticity.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
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
import {
  queryAnalysisNativeSegmentShearAt,
  queryAnalysisNativeSegmentVorticityAt,
  queryAnalysisWindAt,
} from "./analysisQuery.js";
import { ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
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

function sourceProfile(golden: EscNormalizedGolden): EnvironmentalWindProfile {
  return new EnvironmentalWindProfile(
    golden.levels.map((level) => ({
      height: level.height,
      velocity: {
        eastward: level.eastward,
        northward: level.northward,
        vertical: 0,
      },
    })),
  );
}

function firstIndex(
  support: readonly AnalysisSupportState[],
  state: AnalysisSupportState,
): number {
  const index = support.indexOf(state);
  if (index < 0) {
    throw new Error(`no ${state} knot`);
  }
  return index;
}

function lastIndex(
  support: readonly AnalysisSupportState[],
  state: AnalysisSupportState,
): number {
  for (let i = support.length - 1; i >= 0; i--) {
    if (support[i] === state) {
      return i;
    }
  }
  throw new Error(`no ${state} knot`);
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

function lastFullFullIndex(support: readonly AnalysisSupportState[]): number {
  for (let i = support.length - 2; i >= 0; i--) {
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

describe("support-aware Analysis query on production ESC columns", () => {
  it.each(CASES)(
    "$id lower BOUNDARY, FULL–FULL, interior FULL, last FULL–FULL, upper BOUNDARY",
    (spec) => {
      const column = loadColumn(spec);
      const heights = column.profile.levelHeights();
      const support = column.support;

      expect(support[0]).toBe("BOUNDARY_CONDITIONED");
      expect(support[support.length - 1]).toBe("BOUNDARY_CONDITIONED");

      const firstFull = firstIndex(support, "FULL_SUPPORT");
      const lastFull = lastIndex(support, "FULL_SUPPORT");
      expect(firstFull).toBeGreaterThan(0);
      expect(lastFull).toBeLessThan(support.length - 1);
      expect(support[firstFull - 1]).toBe("BOUNDARY_CONDITIONED");
      expect(support[lastFull + 1]).toBe("BOUNDARY_CONDITIONED");

      const lowerMid = (heights[0]! + heights[1]!) / 2;
      expect(queryAnalysisWindAt(column, lowerMid).status).toBe(
        "BOUNDARY_CONDITIONED",
      );
      expect(queryAnalysisNativeSegmentVorticityAt(column, lowerMid).status).toBe(
        "BOUNDARY_CONDITIONED",
      );

      const firstFF = firstFullFullIndex(support);
      const firstFFHeight = (heights[firstFF]! + heights[firstFF + 1]!) / 2;
      expect(queryAnalysisWindAt(column, firstFFHeight).status).toBe(
        "FULL_SUPPORT",
      );
      expect(
        queryAnalysisNativeSegmentVorticityAt(column, firstFFHeight).status,
      ).toBe("FULL_SUPPORT");

      const interior = Math.floor((firstFull + lastFull) / 2);
      expect(support[interior]).toBe("FULL_SUPPORT");
      expect(support[interior + 1]).toBe("FULL_SUPPORT");
      const interiorHeight = (heights[interior]! + heights[interior + 1]!) / 2;
      expect(
        queryAnalysisNativeSegmentVorticityAt(column, interiorHeight).status,
      ).toBe("FULL_SUPPORT");

      const lastFF = lastFullFullIndex(support);
      const lastFFHeight = (heights[lastFF]! + heights[lastFF + 1]!) / 2;
      expect(
        queryAnalysisNativeSegmentVorticityAt(column, lastFFHeight).status,
      ).toBe("FULL_SUPPORT");

      const upperLo = heights[heights.length - 2]!;
      const upperHi = heights[heights.length - 1]!;
      const upperMid = (upperLo + upperHi) / 2;
      expect(queryAnalysisNativeSegmentVorticityAt(column, upperMid).status).toBe(
        "BOUNDARY_CONDITIONED",
      );

      const lastFullHeight = heights[lastFull]!;
      const windAtLastFull = queryAnalysisWindAt(column, lastFullHeight);
      const vorticityAtLastFull = queryAnalysisNativeSegmentVorticityAt(
        column,
        lastFullHeight,
      );
      expect(windAtLastFull.status).toBe("FULL_SUPPORT");
      expect(vorticityAtLastFull.status).toBe("BOUNDARY_CONDITIONED");
      if (vorticityAtLastFull.status !== "BOUNDARY_CONDITIONED") {
        throw new Error("expected BOUNDARY derivative at last FULL knot");
      }
      expect(vorticityAtLastFull.segment).toEqual({
        hLo: lastFullHeight,
        hHi: heights[lastFull + 1]!,
      });
      expect(
        soundingSegmentContainingHeight(column.profile, lastFullHeight),
      ).toEqual(vorticityAtLastFull.segment);
    },
  );

  it("Goshen numeric native-segment shear and ω_h reuse the existing physics formula", () => {
    const spec = CASES[0];
    const column = loadColumn(spec);
    const heights = column.profile.levelHeights();
    const firstFF = firstFullFullIndex(column.support);
    const height = (heights[firstFF]! + heights[firstFF + 1]!) / 2;
    const shear = queryAnalysisNativeSegmentShearAt(column, height);
    const vorticity = queryAnalysisNativeSegmentVorticityAt(column, height);
    if (shear.status === "COLUMN_UNAVAILABLE" || shear.status === "OUT_OF_DOMAIN") {
      throw new Error("expected Goshen FULL–FULL shear");
    }
    if (
      vorticity.status === "COLUMN_UNAVAILABLE" ||
      vorticity.status === "OUT_OF_DOMAIN"
    ) {
      throw new Error("expected Goshen FULL–FULL vorticity");
    }
    const expectedShear = verticalWindShearBetween(
      column.profile,
      shear.segment.hLo,
      shear.segment.hHi,
    );
    expect(shear.shear).toEqual(expectedShear);
    expect(vorticity.vorticity).toEqual(
      horizontalVorticityFromShear(expectedShear),
    );
    expect(shear.provenance).toBe(column.provenance);
    expect(vorticity.method).toBe("native-containing-segment");
  });

  it.each(CASES)(
    "$id Analysis stencil uses Analysis endpoints, not Source",
    (spec) => {
      const column = loadColumn(spec);
      const source = sourceProfile(spec.golden);
      const heights = column.profile.levelHeights();
      const lower = queryAnalysisNativeSegmentShearAt(
        column,
        (heights[0]! + heights[1]!) / 2,
      );
      if (lower.status === "COLUMN_UNAVAILABLE" || lower.status === "OUT_OF_DOMAIN") {
        throw new Error("expected lower segment");
      }
      const analysisShear = verticalWindShearBetween(
        column.profile,
        lower.segment.hLo,
        lower.segment.hHi,
      );
      const sourceShear = verticalWindShearBetween(
        source,
        lower.segment.hLo,
        lower.segment.hHi,
      );
      expect(lower.shear).toEqual(analysisShear);
      expect(lower.shear).not.toEqual(sourceShear);

      const firstFF = firstFullFullIndex(column.support);
      const interior = queryAnalysisNativeSegmentShearAt(
        column,
        (heights[firstFF]! + heights[firstFF + 1]!) / 2,
      );
      if (
        interior.status === "COLUMN_UNAVAILABLE" ||
        interior.status === "OUT_OF_DOMAIN"
      ) {
        throw new Error("expected FULL–FULL segment");
      }
      expect(interior.shear).toEqual(
        verticalWindShearBetween(
          column.profile,
          interior.segment.hLo,
          interior.segment.hHi,
        ),
      );
    },
  );
});
