import { describe, expect, it } from "vitest";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
} from "./analysisTiltingQuery.js";
import { ANALYSIS_QUERY_REPRESENTATION, NATIVE_CONTAINING_SEGMENT_METHOD } from "./analysisQuery.js";
import encodingSrc from "./trajectoryTiltingRenderEncoding.ts?raw";
import {
  encodeTrajectoryTiltingForRender,
  type TrajectoryTiltingColorScale,
} from "./trajectoryTiltingRenderEncoding.js";
import type {
  TrajectoryTiltingProjectedSample,
  TrajectoryTiltingProjection,
} from "./trajectoryTiltingProjection.js";
import type { EscHrTimeAnalysisProvenance } from "./types.js";
import type { AnalysisTiltingTendencyResult } from "./analysisTiltingQuery.js";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "encoding-test",
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

/**
 * Test/fixture scale only. Not T1_COLOR_SCALE_V1.
 * Linear odd map through an explicit fixture span; exact 0 → 0.
 */
const TEST_FIXTURE_SCALE_V0: TrajectoryTiltingColorScale = {
  version: "test-fixture-v0",
  signedUnitFromTiltingTendency(tiltingTendency: number): number {
    const fixtureSpan = 0.01;
    if (tiltingTendency === 0) {
      return 0;
    }
    const unit = tiltingTendency / fixtureSpan;
    if (unit > 1) {
      return 1;
    }
    if (unit < -1) {
      return -1;
    }
    return unit;
  },
};

function numericAnalysis(
  status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED",
  tiltingTendency: number,
): AnalysisTiltingTendencyResult {
  return {
    status,
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency,
    provenance: STUB_PROVENANCE,
  };
}

function sample(
  historyIndex: number,
  y: number,
  analysis: AnalysisTiltingTendencyResult,
): TrajectoryTiltingProjectedSample {
  return {
    historyIndex,
    position: { x: historyIndex * 10, y, z: 0 },
    simulationTime: historyIndex,
    analysis,
  };
}

function encode(
  projection: TrajectoryTiltingProjection,
  scale: TrajectoryTiltingColorScale = TEST_FIXTURE_SCALE_V0,
) {
  return encodeTrajectoryTiltingForRender(projection, scale);
}

describe("encodeTrajectoryTiltingForRender", () => {
  it("maps an empty projection to an empty encoding", () => {
    expect(encode([])).toEqual({ samples: [], valueSegments: [] });
  });

  it("represents a single FULL sample without requiring a line segment", () => {
    const projection = [sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004))];
    const encoding = encode(projection);
    expect(encoding.samples).toHaveLength(1);
    expect(encoding.valueSegments).toEqual([]);
    expect(encoding.samples[0]).toMatchObject({
      historyIndex: 0,
      status: "FULL_SUPPORT",
      tiltingTendency: 0.004,
    });
    if (encoding.samples[0]!.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL sample encoding");
    }
    expect(encoding.samples[0]!.signedUnit).toBe(0.4);
  });

  it("maps positive, exact zero, and negative T1 to distinct signed units", () => {
    const projection = [
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.01)),
      sample(1, 100, numericAnalysis("FULL_SUPPORT", 0)),
      sample(2, 100, numericAnalysis("FULL_SUPPORT", -0.01)),
    ];
    const encoding = encode(projection);
    expect(encoding.samples.map((item) => {
      if (item.status !== "FULL_SUPPORT") {
        throw new Error("expected FULL");
      }
      return item.signedUnit;
    })).toEqual([1, 0, -1]);
    expect(encoding.samples[1]!.status === "FULL_SUPPORT" &&
      encoding.samples[1].tiltingTendency === 0).toBe(true);
  });

  it("BOUNDARY uses the same numeric scale path as FULL and keeps BOUNDARY support", () => {
    const t1 = 0.002;
    const full = encode([sample(0, 100, numericAnalysis("FULL_SUPPORT", t1))]);
    const boundary = encode([
      sample(0, 100, numericAnalysis("BOUNDARY_CONDITIONED", t1)),
    ]);
    if (
      full.samples[0]!.status !== "FULL_SUPPORT" ||
      boundary.samples[0]!.status !== "BOUNDARY_CONDITIONED"
    ) {
      throw new Error("expected numeric encodings");
    }
    expect(boundary.samples[0]!.signedUnit).toBe(full.samples[0]!.signedUnit);
    expect(boundary.samples[0]!.tiltingTendency).toBe(t1);
    expect(boundary.samples[0]!.status).toBe("BOUNDARY_CONDITIONED");
    expect(boundary.samples[0]!.status).not.toBe("FULL_SUPPORT");
  });

  it("OOD has no signed unit and no zero substitution", () => {
    const encoding = encode([
      sample(0, 0, { status: "OUT_OF_DOMAIN", representation: "Analysis", provenance: STUB_PROVENANCE }),
    ]);
    expect(encoding.samples[0]).toEqual({
      historyIndex: 0,
      position: { x: 0, y: 0, z: 0 },
      status: "OUT_OF_DOMAIN",
    });
    expect(encoding.samples[0]).not.toHaveProperty("tiltingTendency");
    expect(encoding.samples[0]).not.toHaveProperty("signedUnit");
    expect(encoding.valueSegments).toEqual([]);
  });

  it("COLUMN_UNAVAILABLE has no signed unit and no Source fallback", () => {
    const encoding = encode([
      sample(0, 200, { status: "COLUMN_UNAVAILABLE" }),
      sample(1, 210, { status: "COLUMN_UNAVAILABLE" }),
    ]);
    expect(encoding.samples.map((item) => item.status)).toEqual([
      "COLUMN_UNAVAILABLE",
      "COLUMN_UNAVAILABLE",
    ]);
    expect(encoding.valueSegments).toEqual([]);
    for (const item of encoding.samples) {
      expect("tiltingTendency" in item).toBe(false);
      expect("signedUnit" in item).toBe(false);
    }
  });

  it("FULL → OOD → OOD → FULL keeps re-entry and does not bridge the gap", () => {
    const projection = [
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004)),
      sample(1, 0, { status: "OUT_OF_DOMAIN", representation: "Analysis", provenance: STUB_PROVENANCE }),
      sample(2, -1, { status: "OUT_OF_DOMAIN", representation: "Analysis", provenance: STUB_PROVENANCE }),
      sample(3, 120, numericAnalysis("FULL_SUPPORT", -0.003)),
    ];
    const encoding = encode(projection);
    expect(encoding.samples.map((item) => item.status)).toEqual([
      "FULL_SUPPORT",
      "OUT_OF_DOMAIN",
      "OUT_OF_DOMAIN",
      "FULL_SUPPORT",
    ]);
    expect(encoding.valueSegments).toEqual([]);
    if (encoding.samples[3]!.status !== "FULL_SUPPORT") {
      throw new Error("expected re-entered FULL");
    }
    expect(encoding.samples[3]!.tiltingTendency).toBe(-0.003);
  });

  it("does not dynamically normalize against other samples or trajectories", () => {
    const lone = encode([
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.002)),
    ]);
    const besideExtreme = encode([
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.002)),
      sample(1, 100, numericAnalysis("FULL_SUPPORT", 0.05)),
    ]);
    if (
      lone.samples[0]!.status !== "FULL_SUPPORT" ||
      besideExtreme.samples[0]!.status !== "FULL_SUPPORT"
    ) {
      throw new Error("expected FULL");
    }
    expect(besideExtreme.samples[0]!.signedUnit).toBe(lone.samples[0]!.signedUnit);
  });

  it("maps exact T1 0 to scale center without an implicit epsilon", () => {
    const encoding = encode([
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0)),
      sample(1, 100, numericAnalysis("FULL_SUPPORT", 1e-12)),
    ]);
    if (
      encoding.samples[0]!.status !== "FULL_SUPPORT" ||
      encoding.samples[1]!.status !== "FULL_SUPPORT"
    ) {
      throw new Error("expected FULL");
    }
    expect(encoding.samples[0]!.signedUnit).toBe(0);
    expect(encoding.samples[1]!.signedUnit).not.toBe(0);
    expect(encoding.samples[1]!.signedUnit).toBe(1e-12 / 0.01);
  });

  it("emits a value segment owned by the earlier sample when both ends are numeric", () => {
    const projection = [
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.005)),
      sample(1, 110, numericAnalysis("BOUNDARY_CONDITIONED", -0.002)),
      sample(2, 120, numericAnalysis("FULL_SUPPORT", 0.001)),
    ];
    const encoding = encode(projection);
    expect(encoding.valueSegments).toHaveLength(2);
    expect(encoding.valueSegments[0]).toMatchObject({
      ownerHistoryIndex: 0,
      nextHistoryIndex: 1,
      support: "FULL_SUPPORT",
    });
    expect(encoding.valueSegments[1]).toMatchObject({
      ownerHistoryIndex: 1,
      nextHistoryIndex: 2,
      support: "BOUNDARY_CONDITIONED",
    });
    expect(encoding.valueSegments[0]!.signedUnit).toBe(0.5);
    expect(encoding.valueSegments[1]!.signedUnit).toBe(-0.2);
    expect(encoding.valueSegments[0]!.from).toEqual(projection[0]!.position);
    expect(encoding.valueSegments[0]!.to).toEqual(projection[1]!.position);
  });

  it("does not emit a value-colored bridge across unsupported recorded samples", () => {
    const projection = [
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004)),
      sample(1, 110, numericAnalysis("FULL_SUPPORT", 0.003)),
      sample(2, 0, { status: "OUT_OF_DOMAIN", representation: "Analysis", provenance: STUB_PROVENANCE }),
      sample(3, -2, { status: "OUT_OF_DOMAIN", representation: "Analysis", provenance: STUB_PROVENANCE }),
      sample(4, 130, numericAnalysis("FULL_SUPPORT", -0.004)),
      sample(5, 140, numericAnalysis("FULL_SUPPORT", -0.005)),
    ];
    const encoding = encode(projection);
    expect(encoding.valueSegments.map((segment) => [
      segment.ownerHistoryIndex,
      segment.nextHistoryIndex,
    ])).toEqual([
      [0, 1],
      [4, 5],
    ]);
  });

  it("does not invent a support-boundary intersection or interpolated sample", () => {
    const encoding = encode([
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004)),
      sample(1, 0, { status: "OUT_OF_DOMAIN", representation: "Analysis", provenance: STUB_PROVENANCE }),
    ]);
    expect(encoding.samples).toHaveLength(2);
    expect(encoding.valueSegments).toEqual([]);
    expect(encoding.samples.map((item) => item.historyIndex)).toEqual([0, 1]);
  });

  it("does not attach terminal or material metadata at y = 0", () => {
    const encoding = encode([
      sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.001)),
      sample(1, 0, numericAnalysis("FULL_SUPPORT", 0.002)),
    ]);
    expect(encoding.samples[1]!.position.y).toBe(0);
    expect(JSON.stringify(encoding)).not.toMatch(
      /isTerminal|isMaterialEndpoint|clamped/,
    );
  });

  it("uses only the injected scale, with no hidden production mapping", () => {
    const projection = [sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004))];
    const other: TrajectoryTiltingColorScale = {
      version: "test-fixture-other",
      signedUnitFromTiltingTendency: (t1) => (t1 === 0 ? 0 : 1),
    };
    const a = encode(projection, TEST_FIXTURE_SCALE_V0);
    const b = encode(projection, other);
    if (a.samples[0]!.status !== "FULL_SUPPORT" || b.samples[0]!.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL");
    }
    expect(a.samples[0]!.signedUnit).toBe(0.4);
    expect(b.samples[0]!.signedUnit).toBe(1);
    expect(a.samples[0]!.signedUnit).not.toBe(b.samples[0]!.signedUnit);
  });

  it("does not import Three, React, or parcel-causal language", () => {
    expect(encodingSrc).not.toMatch(/from ["']three["']/);
    expect(encodingSrc).not.toMatch(/React/);
    expect(encodingSrc).not.toMatch(/parcel/);
    expect(encodingSrc).not.toMatch(/spin-up/);
    expect(encodingSrc).not.toMatch(/accumulate/);
    expect(encodingSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(encodingSrc).not.toMatch(/queryAnalysisTilting/);
  });
});
