import { describe, expect, it } from "vitest";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "./analysisQuery.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  type AnalysisTiltingAlignment,
  type AnalysisTiltingExplanationResult,
} from "./analysisTiltingQuery.js";
import type { EscHrTimeAnalysisProvenance } from "./types.js";
import modelSrc from "./trajectoryTiltingGlyphModel.ts?raw";
import {
  createTrajectoryTiltingGlyphModel,
  displayDisplacementFromWorldVector,
  displayLengthFromPhysicalMagnitude,
  type TrajectoryTiltingGlyphVectorDisplayScale,
} from "./trajectoryTiltingGlyphModel.js";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "glyph-model-test",
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

const METERS_PER_S_MINUS_1 = 1000;

const TEST_FIXTURE_SCALE_V0: TrajectoryTiltingGlyphVectorDisplayScale = {
  version: "test-fixture-v0",
  worldLengthFromPhysicalMagnitude(magnitudeSMinus1: number): number {
    return magnitudeSMinus1 * METERS_PER_S_MINUS_1;
  },
};

function supportedExplanation(
  overrides: {
    status?: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
    omegaX?: number;
    omegaZ?: number;
    omegaHMagnitude?: number;
    dVyDx?: number;
    dVyDz?: number;
    gradientMagnitude?: number;
    alignment?: AnalysisTiltingAlignment;
    segment?: { hLo: number; hHi: number };
  } = {},
): AnalysisTiltingExplanationResult {
  const omegaX = overrides.omegaX ?? 0.02;
  const omegaZ = overrides.omegaZ ?? -0.01;
  const dVyDx = overrides.dVyDx ?? 0.04;
  const dVyDz = overrides.dVyDz ?? 0.03;
  return {
    status: overrides.status ?? "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: overrides.segment ?? { hLo: 10, hHi: 20 },
    tiltingTendency: 0.0005,
    worldHorizontalVorticity: { omegaX, omegaZ },
    updraftHorizontalGradient: { dVyDx, dVyDz },
    omegaHMagnitude: overrides.omegaHMagnitude ?? 0.022360679774997897,
    gradientMagnitude: overrides.gradientMagnitude ?? 0.05,
    alignment: overrides.alignment ?? {
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0.5,
      theta: Math.PI / 3,
    },
    provenance: STUB_PROVENANCE,
  };
}

describe("createTrajectoryTiltingGlyphModel", () => {
  it("A FULL ordinary: exact anchor, world components, magnitudes, alignment", () => {
    const position = { x: 120, y: 850, z: -40 };
    const explanation = supportedExplanation({
      omegaX: 0.02,
      omegaZ: -0.01,
      omegaHMagnitude: 0.3,
      dVyDx: 0.04,
      dVyDz: 0.03,
      gradientMagnitude: 0.4,
      alignment: {
        state: "ALIGNMENT_DEFINED",
        cosTheta: 0.25,
        theta: 1.318116071652818,
      },
    });
    const model = createTrajectoryTiltingGlyphModel(position, explanation);
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.anchor).toEqual(position);
    expect(model.anchor).not.toBe(position);
    expect(model.support).toBe("FULL_SUPPORT");
    expect(model.omega.vectorWorld).toEqual({ x: 0.02, y: 0, z: -0.01 });
    expect(model.gradient.vectorWorld).toEqual({ x: 0.04, y: 0, z: 0.03 });
    expect(model.omega.magnitude).toBe(0.3);
    expect(model.gradient.magnitude).toBe(0.4);
    expect(model.alignment).toEqual({
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0.25,
      theta: 1.318116071652818,
    });
  });

  it("B BOUNDARY: geometry available, support remains BOUNDARY, provenance/segment preserved", () => {
    const explanation = supportedExplanation({
      status: "BOUNDARY_CONDITIONED",
      segment: { hLo: 0, hHi: 5 },
    });
    const model = createTrajectoryTiltingGlyphModel(
      { x: 1, y: 2, z: 3 },
      explanation,
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.support).toBe("BOUNDARY_CONDITIONED");
    expect(model.support).not.toBe("FULL_SUPPORT");
    expect(model.segment).toEqual({ hLo: 0, hHi: 5 });
    expect(model.provenance).toBe(STUB_PROVENANCE);
    expect(model.representation).toBe("Analysis");
    expect("omega" in model).toBe(true);
    expect("gradient" in model).toBe(true);
  });

  it("C OOD: no geometry and no zero-vector substitution", () => {
    const explanation: AnalysisTiltingExplanationResult = {
      status: "OUT_OF_DOMAIN",
      representation: ANALYSIS_QUERY_REPRESENTATION,
      provenance: STUB_PROVENANCE,
    };
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: -1, z: 0 },
      explanation,
    );
    expect(model).toEqual({
      kind: "UNSUPPORTED",
      status: "OUT_OF_DOMAIN",
      representation: "Analysis",
      provenance: STUB_PROVENANCE,
    });
    expect("omega" in model).toBe(false);
    expect("gradient" in model).toBe(false);
    expect("alignment" in model).toBe(false);
    expect("anchor" in model).toBe(false);
  });

  it("D COLUMN_UNAVAILABLE: no geometry", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 8, y: 9, z: 10 },
      { status: "COLUMN_UNAVAILABLE" },
    );
    expect(model).toEqual({
      kind: "UNSUPPORTED",
      status: "COLUMN_UNAVAILABLE",
    });
    expect("omega" in model).toBe(false);
    expect("gradient" in model).toBe(false);
    expect("provenance" in model).toBe(false);
  });

  it("E GRADIENT_DEGENERATE: omega retained, zero gradient has no direction, no θ", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 100, z: 0 },
      supportedExplanation({
        omegaX: 0.05,
        omegaZ: 0,
        omegaHMagnitude: 0.05,
        dVyDx: 0,
        dVyDz: 0,
        gradientMagnitude: 0,
        alignment: { state: "GRADIENT_DEGENERATE" },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.omega.vectorWorld).toEqual({ x: 0.05, y: 0, z: 0 });
    expect(model.omega.magnitude).toBe(0.05);
    expect(model.gradient.vectorWorld).toEqual({ x: 0, y: 0, z: 0 });
    expect(model.gradient.magnitude).toBe(0);
    expect(model.alignment).toEqual({ state: "GRADIENT_DEGENERATE" });
    expect(model.alignment).not.toHaveProperty("theta");
    expect(model.alignment).not.toHaveProperty("cosTheta");
  });

  it("F OMEGA_DEGENERATE: gradient retained, omega has no direction, no θ", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 1, y: 2, z: 3 },
      supportedExplanation({
        omegaX: 0,
        omegaZ: 0,
        omegaHMagnitude: 0,
        dVyDx: 0,
        dVyDz: 0.07,
        gradientMagnitude: 0.07,
        alignment: { state: "OMEGA_DEGENERATE" },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.omega.vectorWorld).toEqual({ x: 0, y: 0, z: 0 });
    expect(model.omega.magnitude).toBe(0);
    expect(model.gradient.vectorWorld).toEqual({ x: 0, y: 0, z: 0.07 });
    expect(model.gradient.magnitude).toBe(0.07);
    expect(model.alignment).toEqual({ state: "OMEGA_DEGENERATE" });
    expect(model.alignment).not.toHaveProperty("theta");
  });

  it("G BOTH_DEGENERATE: neither direction invented, no θ", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 50, z: 0 },
      supportedExplanation({
        omegaX: 0,
        omegaZ: 0,
        omegaHMagnitude: 0,
        dVyDx: 0,
        dVyDz: 0,
        gradientMagnitude: 0,
        alignment: { state: "BOTH_DEGENERATE" },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.omega.vectorWorld).toEqual({ x: 0, y: 0, z: 0 });
    expect(model.gradient.vectorWorld).toEqual({ x: 0, y: 0, z: 0 });
    expect(model.omega.magnitude).toBe(0);
    expect(model.gradient.magnitude).toBe(0);
    expect(model.alignment).toEqual({ state: "BOTH_DEGENERATE" });
    expect(model.alignment).not.toHaveProperty("theta");
  });

  it("H ALIGNED: parallel directions, theta = 0 authority preserved", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 1, z: 0 },
      supportedExplanation({
        omegaX: 0.02,
        omegaZ: 0,
        omegaHMagnitude: 0.02,
        dVyDx: 0.08,
        dVyDz: 0,
        gradientMagnitude: 0.08,
        alignment: { state: "ALIGNMENT_DEFINED", cosTheta: 1, theta: 0 },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED" || model.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected defined alignment");
    }
    expect(model.omega.vectorWorld.x * model.gradient.vectorWorld.z).toBe(
      model.omega.vectorWorld.z * model.gradient.vectorWorld.x,
    );
    expect(model.alignment.theta).toBe(0);
    expect(model.alignment.cosTheta).toBe(1);
  });

  it("I OPPOSED: anti-parallel directions, theta = π", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 1, z: 0 },
      supportedExplanation({
        omegaX: 0.02,
        omegaZ: 0,
        omegaHMagnitude: 0.02,
        dVyDx: -0.06,
        dVyDz: 0,
        gradientMagnitude: 0.06,
        alignment: {
          state: "ALIGNMENT_DEFINED",
          cosTheta: -1,
          theta: Math.PI,
        },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED" || model.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected defined alignment");
    }
    expect(model.alignment.theta).toBe(Math.PI);
    expect(model.alignment.cosTheta).toBe(-1);
  });

  it("J ORTHOGONAL: both nonzero, theta = π/2, not confused with degenerate T1=0", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 1, z: 0 },
      supportedExplanation({
        omegaX: 0.03,
        omegaZ: 0,
        omegaHMagnitude: 0.03,
        dVyDx: 0,
        dVyDz: 0.04,
        gradientMagnitude: 0.04,
        alignment: {
          state: "ALIGNMENT_DEFINED",
          cosTheta: 0,
          theta: Math.PI / 2,
        },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED" || model.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected defined alignment");
    }
    expect(model.omega.magnitude).not.toBe(0);
    expect(model.gradient.magnitude).not.toBe(0);
    expect(model.alignment.state).toBe("ALIGNMENT_DEFINED");
    expect(model.alignment.theta).toBe(Math.PI / 2);
    expect(model.alignment.cosTheta).toBe(0);
    expect(model.alignment.state).not.toBe("GRADIENT_DEGENERATE");
    expect(model.alignment.state).not.toBe("OMEGA_DEGENERATE");
    expect(model.alignment.state).not.toBe("BOTH_DEGENERATE");
  });

  it("K NO RECOMPUTATION: model copies supplied explanation, including inconsistent θ", () => {
    const explanation = supportedExplanation({
      omegaX: 3,
      omegaZ: 4,
      omegaHMagnitude: 9,
      dVyDx: 0,
      dVyDz: 4,
      gradientMagnitude: 7,
      alignment: {
        state: "ALIGNMENT_DEFINED",
        cosTheta: 0.5,
        theta: 1.2,
      },
    });
    const model = createTrajectoryTiltingGlyphModel(
      { x: 9, y: 8, z: 7 },
      explanation,
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED" || model.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected defined alignment");
    }
    expect(model.omega.magnitude).toBe(9);
    expect(model.omega.magnitude).not.toBe(Math.hypot(3, 4));
    expect(model.gradient.magnitude).toBe(7);
    expect(model.gradient.magnitude).not.toBe(4);
    expect(model.alignment.cosTheta).toBe(0.5);
    expect(model.alignment.theta).toBe(1.2);
    expect(model.alignment.theta).not.toBe(Math.acos(0));
  });

  it("L WORLD AXES: omegaX/dVyDx → +X, omegaZ/dVyDz → +Z, world y = 0", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 1, y: 2, z: 3 },
      supportedExplanation({
        omegaX: 0.11,
        omegaZ: -0.22,
        dVyDx: 0.33,
        dVyDz: 0.44,
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.omega.vectorWorld.x).toBe(0.11);
    expect(model.omega.vectorWorld.z).toBe(-0.22);
    expect(model.omega.vectorWorld.y).toBe(0);
    expect(model.gradient.vectorWorld.x).toBe(0.33);
    expect(model.gradient.vectorWorld.z).toBe(0.44);
    expect(model.gradient.vectorWorld.y).toBe(0);
    expect(model.omega.vectorWorld).not.toHaveProperty("omegaEastward");
    expect(model.omega.vectorWorld).not.toHaveProperty("omegaNorthward");
  });

  it("M TERMINAL HEURISTIC ABSENCE: y=0 remains an ordinary Eulerian glyph model", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 15, y: 0, z: -8 },
      supportedExplanation(),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.anchor.y).toBe(0);
    expect(model).not.toHaveProperty("terminal");
    expect(model).not.toHaveProperty("clamp");
    expect(model).not.toHaveProperty("materialEndpoint");
    expect(model).not.toHaveProperty("active");
    expect(model).not.toHaveProperty("impact");
    expect(JSON.stringify(model)).not.toMatch(/terminal|clamp|impact|parcel/i);
  });
});

describe("trajectory tilting glyph display scale", () => {
  it("N COMMON SCALE: same physical magnitude maps to the same display length for both operands", () => {
    const magnitude = 0.04;
    const omegaLength = displayLengthFromPhysicalMagnitude(
      magnitude,
      TEST_FIXTURE_SCALE_V0,
    );
    const gradientLength = displayLengthFromPhysicalMagnitude(
      magnitude,
      TEST_FIXTURE_SCALE_V0,
    );
    expect(omegaLength).toBe(gradientLength);
    expect(omegaLength).toBe(40);
  });

  it("O NO UNIT NORMALIZATION: magnitudes 1 and 2 produce distinguishable lengths", () => {
    expect(
      displayLengthFromPhysicalMagnitude(1, TEST_FIXTURE_SCALE_V0),
    ).toBe(1000);
    expect(
      displayLengthFromPhysicalMagnitude(2, TEST_FIXTURE_SCALE_V0),
    ).toBe(2000);
    const a = displayDisplacementFromWorldVector(
      { x: 1, y: 0, z: 0 },
      1,
      TEST_FIXTURE_SCALE_V0,
    );
    const b = displayDisplacementFromWorldVector(
      { x: 2, y: 0, z: 0 },
      2,
      TEST_FIXTURE_SCALE_V0,
    );
    expect(a).toEqual({ x: 1000, y: 0, z: 0 });
    expect(b).toEqual({ x: 2000, y: 0, z: 0 });
  });

  it("P SCALE REQUIRED: module has no hidden production default scale", () => {
    expect(modelSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(modelSrc).not.toMatch(/DEFAULT_/);
    expect(modelSrc).not.toMatch(/metersPerSMinus1\s*=/);
    expect(createTrajectoryTiltingGlyphModel.length).toBe(2);
    expect(displayLengthFromPhysicalMagnitude.length).toBe(2);
  });

  it("Q SELECTION/POPULATION INDEPENDENCE: length depends only on magnitude and injected scale", () => {
    const first = displayLengthFromPhysicalMagnitude(
      0.015,
      TEST_FIXTURE_SCALE_V0,
    );
    const otherScale: TrajectoryTiltingGlyphVectorDisplayScale = {
      version: "other-fixture",
      worldLengthFromPhysicalMagnitude(magnitudeSMinus1: number): number {
        return magnitudeSMinus1 * 50;
      },
    };
    const other = displayLengthFromPhysicalMagnitude(0.015, otherScale);
    const again = displayLengthFromPhysicalMagnitude(
      0.015,
      TEST_FIXTURE_SCALE_V0,
    );
    expect(first).toBe(again);
    expect(first).toBe(15);
    expect(other).toBe(0.75);
    expect(first).not.toBe(other);
  });

  it("R ZERO: zero magnitude never produces an arbitrary nonzero arrow", () => {
    const lyingScale: TrajectoryTiltingGlyphVectorDisplayScale = {
      version: "lying-fixture",
      worldLengthFromPhysicalMagnitude(): number {
        return 999;
      },
    };
    expect(displayLengthFromPhysicalMagnitude(0, lyingScale)).toBe(0);
    expect(
      displayDisplacementFromWorldVector({ x: 0, y: 0, z: 0 }, 0, lyingScale),
    ).toBeNull();
    expect(
      displayDisplacementFromWorldVector({ x: 1, y: 0, z: 0 }, 0, lyingScale),
    ).toBeNull();
  });
});

describe("trajectory tilting glyph model language / import guards", () => {
  it("does not recompute physics or use causal / parcel wording", () => {
    expect(modelSrc).not.toMatch(/queryAnalysisTilting/);
    expect(modelSrc).not.toMatch(/queryAnalysisNativeSegmentVorticityAt/);
    expect(modelSrc).not.toMatch(/horizontalGradientOfVerticalVelocity/);
    expect(modelSrc).not.toMatch(/Math\.acos/);
    expect(modelSrc).not.toMatch(/Math\.hypot/);
    expect(modelSrc).not.toMatch(/Math\.atan2/);
    expect(modelSrc).not.toMatch(/parcel/);
    expect(modelSrc).not.toMatch(/tracerVorticity|tracerOmega|parcelOmega|parcelVorticity/);
    expect(modelSrc).not.toMatch(/acquired/);
    expect(modelSrc).not.toMatch(/generated vorticity/);
    expect(modelSrc).not.toMatch(/spin-up|spin-down/);
    expect(modelSrc).not.toMatch(/caused motion/);
    expect(modelSrc).not.toMatch(/\bforce\b/);
    expect(modelSrc).not.toMatch(/accumulate/);
    expect(modelSrc).not.toMatch(/delta omega/);
  });
});
