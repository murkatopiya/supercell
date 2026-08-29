import { describe, expect, it } from "vitest";
import {
  T1_COLOR_SCALE_V1,
  T1_COLOR_SCALE_V1_SATURATION,
  T1_COLOR_SCALE_V1_VERSION,
} from "./t1ColorScaleV1.js";
import scaleSrc from "./t1ColorScaleV1.ts?raw";
import { encodeTrajectoryTiltingForRender } from "./trajectoryTiltingRenderEncoding.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
} from "./analysisTiltingQuery.js";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "./analysisQuery.js";
import type { EscHrTimeAnalysisProvenance } from "./types.js";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "color-scale-v1-test",
  samplingClass: "high-resolution-mobile-esc",
  transformId: "esc-hr-time-hamming-sinc-lowpass",
  transformVersion: "v1",
  domain: "TIME",
  cutoffWavelengthS: 40,
  sampleIntervalS: 1,
  tapCount: 81,
  window: "Hamming",
  phase: "zero",
  gapPolicy: "integer-linear-uvh-max-5s",
  interpolatedCount: 0,
  uniformN: 121,
  interpolationFraction: 0,
  maxGapS: 0,
  boundaryPolicy: "half-sample-mirror",
  supportSemantics: "sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED",
  outputCoordinate: "Source heights",
  researchPredecessor: "v0.1-research",
};

describe("T1_COLOR_SCALE_V1", () => {
  it("exposes a stable version identity and frozen saturation", () => {
    expect(T1_COLOR_SCALE_V1_VERSION).toBe("T1_COLOR_SCALE_V1");
    expect(T1_COLOR_SCALE_V1.version).toBe(T1_COLOR_SCALE_V1_VERSION);
    expect(T1_COLOR_SCALE_V1.version).toBe("T1_COLOR_SCALE_V1");
    expect(T1_COLOR_SCALE_V1_SATURATION).toBe(6.100e-5);
  });

  it("maps exact zero to 0, including IEEE signed zero", () => {
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(0)).toBe(0);
    expect(Object.is(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(0), 0)).toBe(
      true,
    );
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-0)).toBe(0);
    expect(
      Object.is(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-0), 0),
    ).toBe(true);
  });

  it("maps ±saturation to ±1 and saturates beyond", () => {
    const sat = T1_COLOR_SCALE_V1_SATURATION;
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(sat)).toBe(1);
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-sat)).toBe(-1);
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(sat * 2)).toBe(1);
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-sat * 2)).toBe(-1);
  });

  it("maps half-saturation proportionally", () => {
    const sat = T1_COLOR_SCALE_V1_SATURATION;
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(sat * 0.5)).toBe(0.5);
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-sat * 0.5)).toBe(
      -0.5,
    );
  });

  it("keeps a tiny nonzero T1 nonzero and does not introduce an epsilon band", () => {
    const positive = T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(1e-12);
    const negative = T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-1e-12);
    expect(positive).not.toBe(0);
    expect(negative).not.toBe(0);
    expect(positive).toBeGreaterThan(0);
    expect(negative).toBeLessThan(0);
    expect(scaleSrc).not.toMatch(/T1_COLOR_SCALE_V1_EPSILON/);
    expect(scaleSrc).not.toMatch(/NEAR_ZERO/);
  });

  it("is symmetric for equal-magnitude opposite signs", () => {
    const t1 = T1_COLOR_SCALE_V1_SATURATION * 0.37;
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(t1)).toBe(
      -T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(-t1),
    );
  });

  it("has no population input, hidden default, or extra runtime state", () => {
    expect(Object.keys(T1_COLOR_SCALE_V1).sort()).toEqual([
      "signedUnitFromTiltingTendency",
      "version",
    ]);
    expect(T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency.length).toBe(1);
    expect(T1_COLOR_SCALE_V1).not.toHaveProperty("population");
    expect(T1_COLOR_SCALE_V1).not.toHaveProperty("calibrate");
    expect(T1_COLOR_SCALE_V1).not.toHaveProperty("saturation");
  });

  it("does not depend on RGB, CSS, or Three appearance", () => {
    expect(scaleSrc).not.toMatch(/from ["']three["']/);
    expect(scaleSrc).not.toMatch(/linearRgb/);
    expect(scaleSrc).not.toMatch(/React/);
    expect(scaleSrc).not.toMatch(/css/i);
  });

  it("does not modify the numeric T1 passed through Slice C encoding", () => {
    const t1 = T1_COLOR_SCALE_V1_SATURATION * 0.25;
    const encoding = encodeTrajectoryTiltingForRender(
      [
        {
          historyIndex: 0,
          position: { x: 1, y: 2, z: 3 },
          simulationTime: 0,
          analysis: {
            status: "FULL_SUPPORT",
            representation: ANALYSIS_QUERY_REPRESENTATION,
            method: NATIVE_CONTAINING_SEGMENT_METHOD,
            physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
            environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
            stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
            segment: { hLo: 10, hHi: 20 },
            tiltingTendency: t1,
            provenance: STUB_PROVENANCE,
          },
        },
      ],
      T1_COLOR_SCALE_V1,
    );
    const sample = encoding.samples[0];
    if (sample?.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL sample");
    }
    expect(sample.tiltingTendency).toBe(t1);
    expect(sample.signedUnit).toBe(0.25);
  });
});
