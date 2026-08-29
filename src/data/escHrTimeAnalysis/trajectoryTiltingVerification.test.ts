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
import modelSrc from "./trajectoryTiltingVerification.ts?raw";
import { createTrajectoryTiltingVerificationModel } from "./trajectoryTiltingVerification.js";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "verify-model-test",
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

function supportedExplanation(
  overrides: {
    status?: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
    tiltingTendency?: number;
    omegaHMagnitude?: number;
    gradientMagnitude?: number;
    alignment?: AnalysisTiltingAlignment;
    segment?: { hLo: number; hHi: number };
  } = {},
): AnalysisTiltingExplanationResult {
  return {
    status: overrides.status ?? "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: overrides.segment ?? { hLo: 10, hHi: 20 },
    tiltingTendency: overrides.tiltingTendency ?? 0.0005,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: -0.01 },
    updraftHorizontalGradient: { dVyDx: 0.04, dVyDz: 0.03 },
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

describe("createTrajectoryTiltingVerificationModel", () => {
  it("A FULL ordinary: T1, magnitudes, alignment, segment, provenance, identity tokens", () => {
    const explanation = supportedExplanation({
      tiltingTendency: 0.0005,
      omegaHMagnitude: 0.3,
      gradientMagnitude: 0.4,
      alignment: {
        state: "ALIGNMENT_DEFINED",
        cosTheta: 0.25,
        theta: 1.318116071652818,
      },
      segment: { hLo: 100, hHi: 250 },
    });
    const recorded = {
      position: { x: 12, y: 80, z: -4 },
      simulationTime: 3.5,
    };
    const model = createTrajectoryTiltingVerificationModel(
      explanation,
      recorded,
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.support).toBe("FULL_SUPPORT");
    expect(model.tiltingTendency).toBe(0.0005);
    expect(model.omegaHMagnitude).toBe(0.3);
    expect(model.gradientMagnitude).toBe(0.4);
    expect(model.alignment).toEqual({
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0.25,
      theta: 1.318116071652818,
    });
    expect(model.segment).toEqual({ hLo: 100, hHi: 250 });
    expect(model.provenance).toBe(STUB_PROVENANCE);
    expect(model.representation).toBe("Analysis");
    expect(model.method).toBe("native-containing-segment");
    expect(model.physicalIdentity).toBe(ANALYSIS_TILTING_PHYSICAL_IDENTITY);
    expect(model.environmentalOperand).toBe(
      ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    );
    expect(model.stormLocalOperand).toBe(ANALYSIS_TILTING_STORM_LOCAL_OPERAND);
    expect(model.recordedSample).toEqual(recorded);
    expect(model.recordedSample?.position).not.toBe(recorded.position);
  });

  it("B BOUNDARY: numeric values present, support remains BOUNDARY", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
        status: "BOUNDARY_CONDITIONED",
        tiltingTendency: -0.001,
        segment: { hLo: 0, hHi: 5 },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.support).toBe("BOUNDARY_CONDITIONED");
    expect(model.support).not.toBe("FULL_SUPPORT");
    expect(model.tiltingTendency).toBe(-0.001);
    expect(model.segment).toEqual({ hLo: 0, hHi: 5 });
    expect(model.provenance).toBe(STUB_PROVENANCE);
  });

  it("C OOD: no numeric payload and no fake zero", () => {
    const model = createTrajectoryTiltingVerificationModel({
      status: "OUT_OF_DOMAIN",
      representation: ANALYSIS_QUERY_REPRESENTATION,
      provenance: STUB_PROVENANCE,
    });
    expect(model).toEqual({
      kind: "UNSUPPORTED",
      status: "OUT_OF_DOMAIN",
      representation: "Analysis",
      provenance: STUB_PROVENANCE,
    });
    expect("tiltingTendency" in model).toBe(false);
    expect("omegaHMagnitude" in model).toBe(false);
    expect("gradientMagnitude" in model).toBe(false);
    expect("alignment" in model).toBe(false);
  });

  it("D COLUMN_UNAVAILABLE: no numeric payload", () => {
    const model = createTrajectoryTiltingVerificationModel({
      status: "COLUMN_UNAVAILABLE",
    });
    expect(model).toEqual({
      kind: "UNSUPPORTED",
      status: "COLUMN_UNAVAILABLE",
    });
    expect("tiltingTendency" in model).toBe(false);
    expect("provenance" in model).toBe(false);
  });

  it("E GRADIENT_DEGENERATE: T1 zero, omega retained, theta/cos absent", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
        tiltingTendency: 0,
        omegaHMagnitude: 0.05,
        gradientMagnitude: 0,
        alignment: { state: "GRADIENT_DEGENERATE" },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.tiltingTendency).toBe(0);
    expect(model.omegaHMagnitude).toBe(0.05);
    expect(model.gradientMagnitude).toBe(0);
    expect(model.alignment).toEqual({ state: "GRADIENT_DEGENERATE" });
    expect(model.alignment).not.toHaveProperty("theta");
    expect(model.alignment).not.toHaveProperty("cosTheta");
  });

  it("F OMEGA_DEGENERATE: T1 zero, gradient retained, theta/cos absent", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
        tiltingTendency: 0,
        omegaHMagnitude: 0,
        gradientMagnitude: 0.07,
        alignment: { state: "OMEGA_DEGENERATE" },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.tiltingTendency).toBe(0);
    expect(model.omegaHMagnitude).toBe(0);
    expect(model.gradientMagnitude).toBe(0.07);
    expect(model.alignment).toEqual({ state: "OMEGA_DEGENERATE" });
    expect(model.alignment).not.toHaveProperty("theta");
  });

  it("G BOTH_DEGENERATE: both magnitudes zero, theta/cos absent", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
        tiltingTendency: 0,
        omegaHMagnitude: 0,
        gradientMagnitude: 0,
        alignment: { state: "BOTH_DEGENERATE" },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED") {
      throw new Error("expected SUPPORTED");
    }
    expect(model.tiltingTendency).toBe(0);
    expect(model.omegaHMagnitude).toBe(0);
    expect(model.gradientMagnitude).toBe(0);
    expect(model.alignment).toEqual({ state: "BOTH_DEGENERATE" });
    expect(model.alignment).not.toHaveProperty("theta");
  });

  it("H ORTHOGONAL: both magnitudes nonzero, T1 zero, defined θ = π/2", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
        tiltingTendency: 0,
        omegaHMagnitude: 0.03,
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
    expect(model.tiltingTendency).toBe(0);
    expect(model.omegaHMagnitude).not.toBe(0);
    expect(model.gradientMagnitude).not.toBe(0);
    expect(model.alignment.cosTheta).toBe(0);
    expect(model.alignment.theta).toBe(Math.PI / 2);
    expect(model.alignment.state).not.toBe("GRADIENT_DEGENERATE");
    expect(model.alignment.state).not.toBe("OMEGA_DEGENERATE");
    expect(model.alignment.state).not.toBe("BOTH_DEGENERATE");
  });

  it("I ALIGNED: theta = 0, cos = +1", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
        alignment: { state: "ALIGNMENT_DEFINED", cosTheta: 1, theta: 0 },
      }),
    );
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED" || model.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected defined alignment");
    }
    expect(model.alignment.theta).toBe(0);
    expect(model.alignment.cosTheta).toBe(1);
  });

  it("J OPPOSED: theta = π, cos = -1", () => {
    const model = createTrajectoryTiltingVerificationModel(
      supportedExplanation({
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

  it("K NO RECOMPUTATION: copies supplied explanation, including inconsistent T1/θ", () => {
    const explanation = supportedExplanation({
      tiltingTendency: 12.5,
      omegaHMagnitude: 9,
      gradientMagnitude: 7,
      alignment: {
        state: "ALIGNMENT_DEFINED",
        cosTheta: 0.5,
        theta: 1.2,
      },
    });
    const model = createTrajectoryTiltingVerificationModel(explanation);
    expect(model.kind).toBe("SUPPORTED");
    if (model.kind !== "SUPPORTED" || model.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected defined alignment");
    }
    expect(model.tiltingTendency).toBe(12.5);
    expect(model.tiltingTendency).not.toBe(9 * 7 * 0.5);
    expect(model.omegaHMagnitude).toBe(9);
    expect(model.gradientMagnitude).toBe(7);
    expect(model.alignment.cosTheta).toBe(0.5);
    expect(model.alignment.theta).toBe(1.2);
    expect(model.alignment.theta).not.toBe(Math.acos(0.5));
  });

  it("L NO RENDERER AUTHORITY: model has no Three.js / glyph / query physics", () => {
    expect(modelSrc).not.toMatch(/three/);
    expect(modelSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(modelSrc).not.toMatch(/queryAnalysisTilting/);
    expect(modelSrc).not.toMatch(/queryAnalysisNativeSegmentVorticityAt/);
    expect(modelSrc).not.toMatch(/Math\.acos/);
    expect(modelSrc).not.toMatch(/Math\.hypot/);
    expect(modelSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(modelSrc).not.toMatch(/parcel/);
    expect(modelSrc).not.toMatch(/spin-up|spin-down/);
    expect(modelSrc).not.toMatch(/acquired|generated rotation/);
    expect(modelSrc).not.toMatch(/\bforce\b/);
    expect(modelSrc).not.toMatch(/what-if|whatIf/);
    expect(modelSrc).not.toMatch(/omega_y|ω_y,current/);
  });
});
