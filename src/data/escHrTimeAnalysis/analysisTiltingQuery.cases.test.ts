import { describe, expect, it } from "vitest";
import type { Vec3 } from "../../core/math/Vec3.js";
import { worldHorizontalVorticityFromAtmospheric } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
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
import {
  queryAnalysisNativeSegmentVorticityAt,
  queryAnalysisWindAt,
} from "./analysisQuery.js";
import {
  queryAnalysisTiltingExplanationAt,
  queryAnalysisTiltingTendencyAt,
} from "./analysisTiltingQuery.js";
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

function expectedLaboratoryTilting(
  vorticity: {
    omegaEastward: number;
    omegaNorthward: number;
  },
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): number {
  const world = worldHorizontalVorticityFromAtmospheric(vorticity);
  const gradient = updraft.horizontalGradientOfVerticalVelocity(
    position,
    time,
  );
  const tiltingTendency =
    world.omegaX * gradient.dVyDx + world.omegaZ * gradient.dVyDz;
  return tiltingTendency === 0 ? 0 : tiltingTendency;
}

describe("support-aware Analysis laboratory T1 on production ESC columns", () => {
  it.each(CASES)(
    "$id FULL, BOUNDARY, OOD, last-FULL-knot BOUNDARY T1, axis physical zero",
    (spec) => {
      const column = loadColumn(spec);
      const updraft = prescribedUpdraft();
      const heights = column.profile.levelHeights();
      const support = column.support;

      const firstFF = firstFullFullIndex(support);
      const fullHeight = (heights[firstFF]! + heights[firstFF + 1]!) / 2;
      const fullPosition: Vec3 = { x: 800, y: fullHeight, z: 400 };
      const fullVorticity = queryAnalysisNativeSegmentVorticityAt(
        column,
        fullHeight,
      );
      const fullT1 = queryAnalysisTiltingTendencyAt(
        column,
        updraft,
        fullPosition,
        0,
      );
      expect(fullVorticity.status).toBe("FULL_SUPPORT");
      expect(fullT1.status).toBe("FULL_SUPPORT");
      if (fullT1.status !== "FULL_SUPPORT") {
        throw new Error(`${spec.id}: expected FULL T1`);
      }
      if (fullVorticity.status !== "FULL_SUPPORT") {
        throw new Error(`${spec.id}: expected FULL ω_h`);
      }
      expect(fullT1.tiltingTendency).toBe(
        expectedLaboratoryTilting(
          fullVorticity.vorticity,
          updraft,
          fullPosition,
          0,
        ),
      );

      const lowerMid = (heights[0]! + heights[1]!) / 2;
      const boundaryPosition: Vec3 = { x: 800, y: lowerMid, z: 400 };
      const boundaryVorticity = queryAnalysisNativeSegmentVorticityAt(
        column,
        lowerMid,
      );
      const boundaryT1 = queryAnalysisTiltingTendencyAt(
        column,
        updraft,
        boundaryPosition,
        0,
      );
      expect(boundaryVorticity.status).toBe("BOUNDARY_CONDITIONED");
      expect(boundaryT1.status).toBe("BOUNDARY_CONDITIONED");
      expect(boundaryT1.status).not.toBe("FULL_SUPPORT");
      if (boundaryT1.status !== "BOUNDARY_CONDITIONED") {
        throw new Error(`${spec.id}: expected BOUNDARY T1`);
      }
      if (boundaryVorticity.status !== "BOUNDARY_CONDITIONED") {
        throw new Error(`${spec.id}: expected BOUNDARY ω_h`);
      }
      expect(boundaryT1.tiltingTendency).toBe(
        expectedLaboratoryTilting(
          boundaryVorticity.vorticity,
          updraft,
          boundaryPosition,
          0,
        ),
      );

      const ood = queryAnalysisTiltingTendencyAt(
        column,
        updraft,
        { x: 800, y: column.profile.minHeight - 10, z: 400 },
        0,
      );
      expect(ood.status).toBe("OUT_OF_DOMAIN");
      expect("tiltingTendency" in ood).toBe(false);

      const lastFull = lastIndex(support, "FULL_SUPPORT");
      const lastFullHeight = heights[lastFull]!;
      expect(queryAnalysisWindAt(column, lastFullHeight).status).toBe(
        "FULL_SUPPORT",
      );
      expect(
        queryAnalysisNativeSegmentVorticityAt(column, lastFullHeight).status,
      ).toBe("BOUNDARY_CONDITIONED");
      const lastFullT1 = queryAnalysisTiltingTendencyAt(
        column,
        updraft,
        { x: 800, y: lastFullHeight, z: 400 },
        0,
      );
      expect(lastFullT1.status).toBe("BOUNDARY_CONDITIONED");

      const axisT1 = queryAnalysisTiltingTendencyAt(
        column,
        updraft,
        { x: 0, y: fullHeight, z: 0 },
        0,
      );
      expect(axisT1.status).toBe("FULL_SUPPORT");
      if (axisT1.status !== "FULL_SUPPORT") {
        throw new Error(`${spec.id}: expected FULL physical zero`);
      }
      expect(axisT1.tiltingTendency).toBe(0);
      expect(Object.is(axisT1.tiltingTendency, 0)).toBe(true);

      const fullExplanation = queryAnalysisTiltingExplanationAt(
        column,
        updraft,
        fullPosition,
        0,
      );
      expect(fullExplanation.status).toBe(fullT1.status);
      if (fullExplanation.status !== "FULL_SUPPORT") {
        throw new Error(`${spec.id}: expected FULL explanation`);
      }
      expect(fullExplanation.tiltingTendency).toBe(fullT1.tiltingTendency);
      expect(fullExplanation.segment).toEqual(fullT1.segment);
      expect(fullExplanation.provenance).toBe(fullT1.provenance);

      const boundaryExplanation = queryAnalysisTiltingExplanationAt(
        column,
        updraft,
        boundaryPosition,
        0,
      );
      expect(boundaryExplanation.status).toBe(boundaryT1.status);
      if (boundaryExplanation.status !== "BOUNDARY_CONDITIONED") {
        throw new Error(`${spec.id}: expected BOUNDARY explanation`);
      }
      expect(boundaryExplanation.tiltingTendency).toBe(
        boundaryT1.tiltingTendency,
      );

      const oodExplanation = queryAnalysisTiltingExplanationAt(
        column,
        updraft,
        { x: 800, y: column.profile.minHeight - 10, z: 400 },
        0,
      );
      expect(oodExplanation.status).toBe(ood.status);
      expect("tiltingTendency" in oodExplanation).toBe(false);
    },
  );
});
