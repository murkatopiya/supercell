import { describe, expect, it } from "vitest";
import { OUN_MOORE_20130520_SPEC } from "../igra/igraObservedSoundingSpec.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import { classifyAnalysisSupport } from "./classifyAnalysisSupport.js";
import { COARSE_OPERATIONAL_RAOB, ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import type { EscHrTimeAnalysisInputSample } from "./types.js";

function rampSamples(
  firstTime: number,
  lastTime: number,
  skipTimes: readonly number[] = [],
): EscHrTimeAnalysisInputSample[] {
  const skip = new Set(skipTimes);
  const samples: EscHrTimeAnalysisInputSample[] = [];
  for (let time = firstTime; time <= lastTime; time += 1) {
    if (skip.has(time)) continue;
    samples.push({
      time,
      height: 10 + time * 5,
      eastward: time * 0.1,
      northward: 2,
    });
  }
  return samples;
}

describe("createEscHrTimeAnalysis failure policy", () => {
  it("rejects coarse-operational-raob by sampling class without fabricating TIME", () => {
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: COARSE_OPERATIONAL_RAOB,
        sourceIdentity: OUN_MOORE_20130520_SPEC.sourceIdentity,
        samples: [],
      }),
    ).toThrow(EscAnalysisError);
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: COARSE_OPERATIONAL_RAOB,
        sourceIdentity: OUN_MOORE_20130520_SPEC.sourceIdentity,
        samples: [],
      }),
    ).toThrow(/high-resolution-mobile-esc/);
  });

  it("rejects missing Source identity", () => {
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: "",
        samples: rampSamples(0, 120),
      }),
    ).toThrow(/Source identity is missing/);
  });

  it("rejects non-finite TIME", () => {
    const samples = rampSamples(0, 120);
    samples[1] = { ...samples[1]!, time: Number.NaN };
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: "synthetic",
        samples,
      }),
    ).toThrow(/TIME\[1] must be finite/);
  });

  it("rejects non-integer TIME", () => {
    const samples = rampSamples(0, 120);
    samples[2] = { ...samples[2]!, time: 2.5 };
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: "synthetic",
        samples,
      }),
    ).toThrow(/integer second/);
  });

  it("rejects duplicate TIME", () => {
    const samples = rampSamples(0, 120);
    samples[3] = { ...samples[3]!, time: samples[2]!.time };
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: "synthetic",
        samples,
      }),
    ).toThrow(/strictly increasing/);
  });

  it("rejects a gap larger than 5 s without changing the operator", () => {
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: "synthetic",
        samples: rampSamples(0, 120, [10, 11, 12, 13, 14, 15]),
      }),
    ).toThrow(/exceeds maximum reconstructable 5 s/);
  });

  it("rejects a series too short for FULL_SUPPORT", () => {
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
        sourceIdentity: "synthetic",
        samples: rampSamples(0, 79),
      }),
    ).toThrow(/too short/);
  });
});

describe("createEscHrTimeAnalysis support and output", () => {
  it("keeps Source heights, maps winds at retained times, and classifies TIME support", () => {
    const samples = rampSamples(-1, 120, [50]);
    const analysis = createEscHrTimeAnalysis({
      samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
      sourceIdentity: "synthetic-ramp",
      samples,
    });

    expect(analysis.profile.levelHeights()).toEqual(
      samples.map((sample) => sample.height),
    );
    expect(analysis.support).toHaveLength(samples.length);
    expect(analysis.provenance.interpolatedCount).toBe(1);
    expect(analysis.provenance.gapPolicy).toBe("integer-linear-uvh-max-5s");
    expect(analysis.provenance.boundaryPolicy).toBe("half-sample-mirror");
    expect(analysis.provenance.transformId).toBe(
      "esc-hr-time-hamming-sinc-lowpass",
    );
    expect(analysis.provenance.transformVersion).toBe("v1");
    expect(analysis.provenance.domain).toBe("TIME");

    expect(classifyAnalysisSupport(-1, -1, 120)).toBe("BOUNDARY_CONDITIONED");
    expect(classifyAnalysisSupport(39, -1, 120)).toBe("FULL_SUPPORT");
    expect(analysis.support[0]).toBe("BOUNDARY_CONDITIONED");
    const firstFull = samples.findIndex((sample) => sample.time === 39);
    expect(analysis.support[firstFull]).toBe("FULL_SUPPORT");
  });
});
