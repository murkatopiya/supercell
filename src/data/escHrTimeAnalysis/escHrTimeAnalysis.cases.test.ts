import { describe, expect, it } from "vitest";
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
import { ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import type { EscHrTimeAnalysisInputSample } from "./types.js";

interface RetainedTimeGolden {
  times: number[];
}

const CASES = [
  {
    id: "goshen",
    spec: NSSL1_GOSHEN_2155_SPEC,
    golden: goshenGoldenJson as EscNormalizedGolden,
    times: (goshenTimeJson as RetainedTimeGolden).times,
    expectedN: 2029,
    expectedFirstTime: 0,
    expectedLastTime: 2080,
    interpolatedCount: 52,
    interpolationFraction: 0.02499,
    firstKnot: { eastward: -2.5138, northward: 5.6671 },
    lastKnot: { eastward: 30.4402, northward: 3.8006 },
    bulk1000to6: 28.1385,
  },
  {
    id: "prospect",
    spec: NSSL1_PROSPECT_VALLEY_222346_SPEC,
    golden: prospectGoldenJson as EscNormalizedGolden,
    times: (prospectTimeJson as RetainedTimeGolden).times,
    expectedN: 2733,
    expectedFirstTime: -1,
    expectedLastTime: 2822,
    interpolatedCount: 91,
    interpolationFraction: 0.03222,
    firstKnot: { eastward: -4.5505, northward: 6.9042 },
    lastKnot: { eastward: 14.8664, northward: 17.5192 },
    bulk1000to6: 20.0485,
  },
  {
    id: "dumas",
    spec: NSSL2_DUMAS_215218_SPEC,
    golden: nssl2DumasGoldenJson as EscNormalizedGolden,
    times: (nssl2DumasTimeJson as RetainedTimeGolden).times,
    expectedN: 2917,
    expectedFirstTime: -1,
    expectedLastTime: 3020,
    interpolatedCount: 105,
    interpolationFraction: 0.03475,
    firstKnot: { eastward: -3.1235, northward: 4.0624 },
    lastKnot: { eastward: 10.6791, northward: -4.4897 },
    bulk1000to6: 20.6384,
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

function bulkMagnitude(
  profile: {
    sampleAtHeight: (height: number) => {
      eastward: number;
      northward: number;
    };
  },
  h0: number,
  h1: number,
): number {
  const v0 = profile.sampleAtHeight(h0);
  const v1 = profile.sampleAtHeight(h1);
  return Math.hypot(v1.eastward - v0.eastward, v1.northward - v0.northward);
}

describe("high-resolution ESC v1 Analysis column", () => {
  it.each(CASES)(
    "$id reproduces Source alignment, gaps, support, and research checkpoints",
    (spec) => {
      expect(spec.golden.levels).toHaveLength(spec.expectedN);
      expect(spec.times).toHaveLength(spec.expectedN);
      expect(spec.times[0]).toBe(spec.expectedFirstTime);
      expect(spec.times[spec.times.length - 1]).toBe(spec.expectedLastTime);

      const samples = zipSamples(spec.golden, spec.times);
      expect(
        samples.map((sample) => ({
          height: sample.height,
          eastward: sample.eastward,
          northward: sample.northward,
        })),
      ).toEqual(spec.golden.levels);

      const analysis = createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: spec.spec.sourceIdentity,
        samples,
      });

      expect(analysis.profile.levelHeights()).toEqual(
        spec.golden.levels.map((level) => level.height),
      );
      expect(analysis.support).toHaveLength(spec.expectedN);
      expect(analysis.provenance.interpolatedCount).toBe(spec.interpolatedCount);
      expect(analysis.provenance.interpolationFraction).toBeCloseTo(
        spec.interpolationFraction,
        5,
      );
      expect(analysis.provenance.sourceIdentity).toBe(spec.spec.sourceIdentity);
      expect(analysis.provenance.samplingClass).toBe(
        ESC_HR_TIME_SAMPLING_CLASS,
      );
      expect(analysis.provenance.tapCount).toBe(81);
      expect(analysis.provenance.cutoffWavelengthS).toBe(40);

      const first = analysis.profile.sampleAtHeight(spec.golden.levels[0]!.height);
      expect(first.eastward).toBeCloseTo(spec.firstKnot.eastward, 4);
      expect(first.northward).toBeCloseTo(spec.firstKnot.northward, 4);
      const last = analysis.profile.sampleAtHeight(
        spec.golden.levels[spec.expectedN - 1]!.height,
      );
      expect(last.eastward).toBeCloseTo(spec.lastKnot.eastward, 4);
      expect(last.northward).toBeCloseTo(spec.lastKnot.northward, 4);
      expect(bulkMagnitude(analysis.profile, 1000, 6000)).toBeCloseTo(
        spec.bulk1000to6,
        4,
      );

      const firstTime = spec.expectedFirstTime;
      const lastTime = spec.expectedLastTime;
      for (let i = 0; i < samples.length; i++) {
        const time = samples[i]!.time;
        const expected =
          time >= firstTime + 40 && time <= lastTime - 40
            ? "FULL_SUPPORT"
            : "BOUNDARY_CONDITIONED";
        expect(analysis.support[i]).toBe(expected);
      }
      expect(analysis.support[0]).toBe("BOUNDARY_CONDITIONED");
      expect(analysis.support[analysis.support.length - 1]).toBe(
        "BOUNDARY_CONDITIONED",
      );
    },
  );
});
