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
import modelSrc from "./trajectoryTiltingWhatIf.ts?raw";
import {
  counterfactualTiltingTendency,
  createTrajectoryTiltingWhatIfModel,
  initialThetaWhatIfFromActual,
  TrajectoryTiltingWhatIfError,
} from "./trajectoryTiltingWhatIf.js";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "whatif-model-test",
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
    omegaX?: number;
    omegaZ?: number;
    omegaHMagnitude?: number;
    dVyDx?: number;
    dVyDz?: number;
    gradientMagnitude?: number;
    alignment?: AnalysisTiltingAlignment;
  } = {},
): AnalysisTiltingExplanationResult {
  return {
    status: overrides.status ?? "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: overrides.tiltingTendency ?? 0.0008,
    worldHorizontalVorticity: {
      omegaX: overrides.omegaX ?? 0.02,
      omegaZ: overrides.omegaZ ?? 0,
    },
    updraftHorizontalGradient: {
      dVyDx: overrides.dVyDx ?? 0,
      dVyDz: overrides.dVyDz ?? 0.04,
    },
    omegaHMagnitude: overrides.omegaHMagnitude ?? 0.02,
    gradientMagnitude: overrides.gradientMagnitude ?? 0.04,
    alignment: overrides.alignment ?? {
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0,
      theta: Math.PI / 2,
    },
    provenance: STUB_PROVENANCE,
  };
}

function hypotXZ(v: { x: number; z: number }): number {
  return Math.hypot(v.x, v.z);
}

function crossY(
  omega: { x: number; z: number },
  gradient: { x: number; z: number },
): number {
  const om = Math.hypot(omega.x, omega.z);
  const gm = Math.hypot(gradient.x, gradient.z);
  return (omega.z / om) * (gradient.x / gm) - (omega.x / om) * (gradient.z / gm);
}

describe("createTrajectoryTiltingWhatIfModel", () => {
  it("A ordinary ALIGNMENT_DEFINED: actual preserved, what-if computed", () => {
    const explanation = supportedExplanation();
    const model = createTrajectoryTiltingWhatIfModel(explanation, Math.PI / 4);
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.actualTiltingTendency).toBe(0.0008);
    expect(model.actualTheta).toBe(Math.PI / 2);
    expect(model.thetaWhatIf).toBe(Math.PI / 4);
    expect(model.whatIfTiltingTendency).toBe(
      counterfactualTiltingTendency(0.02, 0.04, Math.PI / 4),
    );
    expect(model.support).toBe("FULL_SUPPORT");
  });

  it("B theta 0: T1_whatif = +A·B", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      0,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.whatIfTiltingTendency).toBe(0.02 * 0.04);
    expect(model.whatIfTiltingTendency).toBeGreaterThan(0);
  });

  it("C theta π/2: T1_whatif is exact +0, not a tiny cosine residual", () => {
    const residual = 0.02 * 0.04 * Math.cos(Math.PI / 2);
    expect(residual).not.toBe(0);
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      Math.PI / 2,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.whatIfTiltingTendency).toBe(0);
    expect(Object.is(model.whatIfTiltingTendency, -0)).toBe(false);
  });

  it("D theta π: T1_whatif = −A·B", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      Math.PI,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.whatIfTiltingTendency).toBe(-0.02 * 0.04);
    expect(model.whatIfTiltingTendency).toBeLessThan(0);
  });

  it("E intermediate acute: positive T1", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      Math.PI / 6,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.whatIfTiltingTendency).toBeGreaterThan(0);
  });

  it("F intermediate obtuse: negative T1", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation(),
      (2 * Math.PI) / 3,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.whatIfTiltingTendency).toBeLessThan(0);
  });

  it("G actual T1 authority: inconsistent supplied actual T1 is preserved", () => {
    const explanation = supportedExplanation({
      tiltingTendency: 12.5,
      omegaHMagnitude: 2,
      gradientMagnitude: 3,
      alignment: {
        state: "ALIGNMENT_DEFINED",
        cosTheta: 0.5,
        theta: Math.PI / 3,
      },
    });
    const model = createTrajectoryTiltingWhatIfModel(explanation, 0);
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.actualTiltingTendency).toBe(12.5);
    expect(model.actualTiltingTendency).not.toBe(2 * 3 * 0.5);
    expect(model.whatIfTiltingTendency).toBe(6);
  });

  it("H magnitudes stay fixed when theta changes", () => {
    const explanation = supportedExplanation();
    const a = createTrajectoryTiltingWhatIfModel(explanation, 0.2);
    const b = createTrajectoryTiltingWhatIfModel(explanation, 2.2);
    expect(a.kind).toBe("AVAILABLE");
    expect(b.kind).toBe("AVAILABLE");
    if (a.kind !== "AVAILABLE" || b.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(a.omegaHMagnitude).toBe(0.02);
    expect(b.omegaHMagnitude).toBe(0.02);
    expect(a.gradientMagnitude).toBe(0.04);
    expect(b.gradientMagnitude).toBe(0.04);
  });

  it("I omega world vector is fixed", () => {
    const explanation = supportedExplanation({ omegaX: 0.02, omegaZ: -0.01 });
    const a = createTrajectoryTiltingWhatIfModel(explanation, 0.3);
    const b = createTrajectoryTiltingWhatIfModel(explanation, 2.5);
    expect(a.kind).toBe("AVAILABLE");
    expect(b.kind).toBe("AVAILABLE");
    if (a.kind !== "AVAILABLE" || b.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(a.fixedOmegaVectorWorld).toEqual({ x: 0.02, y: 0, z: -0.01 });
    expect(b.fixedOmegaVectorWorld).toEqual(a.fixedOmegaVectorWorld);
  });

  it("J hypothetical gradient magnitude equals actual gradient magnitude", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({ gradientMagnitude: 0.04 }),
      0.7,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(hypotXZ(model.hypotheticalGradientVectorWorld)).toBeCloseTo(
      0.04,
      12,
    );
    expect(model.gradientMagnitude).toBe(0.04);
  });

  it("K branch continuity: hypothetical stays on the actual-gradient side of omega", () => {
    const explanation = supportedExplanation({
      omegaX: 0.02,
      omegaZ: 0,
      dVyDx: 0,
      dVyDz: 0.04,
    });
    const actualSign = Math.sign(crossY({ x: 0.02, z: 0 }, { x: 0, z: 0.04 }));
    expect(actualSign).toBe(-1);
    const first = createTrajectoryTiltingWhatIfModel(explanation, 0.2);
    const second = createTrajectoryTiltingWhatIfModel(explanation, 1.4);
    expect(first.kind).toBe("AVAILABLE");
    expect(second.kind).toBe("AVAILABLE");
    if (first.kind !== "AVAILABLE" || second.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(first.branchSign).toBe(-1);
    expect(second.branchSign).toBe(-1);
    expect(
      Math.sign(
        crossY(first.fixedOmegaVectorWorld, first.hypotheticalGradientVectorWorld),
      ),
    ).toBe(-1);
    expect(
      Math.sign(
        crossY(
          second.fixedOmegaVectorWorld,
          second.hypotheticalGradientVectorWorld,
        ),
      ),
    ).toBe(-1);
  });

  it("L aligned actual fallback branch is deterministic +1", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({
        omegaX: 0.02,
        omegaZ: 0,
        dVyDx: 0.04,
        dVyDz: 0,
        alignment: { state: "ALIGNMENT_DEFINED", cosTheta: 1, theta: 0 },
      }),
      Math.PI / 2,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.branchSign).toBe(1);
    expect(model.hypotheticalGradientVectorWorld.x).toBeCloseTo(0, 12);
    expect(model.hypotheticalGradientVectorWorld.z).toBeCloseTo(-0.04, 12);
  });

  it("M opposed actual fallback branch is deterministic +1", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({
        omegaX: 0.02,
        omegaZ: 0,
        dVyDx: -0.04,
        dVyDz: 0,
        alignment: {
          state: "ALIGNMENT_DEFINED",
          cosTheta: -1,
          theta: Math.PI,
        },
      }),
      Math.PI / 2,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.branchSign).toBe(1);
    expect(model.hypotheticalGradientVectorWorld.z).toBeCloseTo(-0.04, 12);
  });

  it("N GRADIENT_DEGENERATE is unavailable", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({
        gradientMagnitude: 0,
        dVyDx: 0,
        dVyDz: 0,
        alignment: { state: "GRADIENT_DEGENERATE" },
      }),
      0,
    );
    expect(model).toEqual({
      kind: "UNAVAILABLE",
      reason: "GRADIENT_DEGENERATE",
    });
  });

  it("O OMEGA_DEGENERATE is unavailable", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({
        omegaHMagnitude: 0,
        omegaX: 0,
        omegaZ: 0,
        alignment: { state: "OMEGA_DEGENERATE" },
      }),
      Math.PI / 2,
    );
    expect(model).toEqual({
      kind: "UNAVAILABLE",
      reason: "OMEGA_DEGENERATE",
    });
  });

  it("P BOTH_DEGENERATE is unavailable", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({
        omegaHMagnitude: 0,
        gradientMagnitude: 0,
        omegaX: 0,
        omegaZ: 0,
        dVyDx: 0,
        dVyDz: 0,
        alignment: { state: "BOTH_DEGENERATE" },
      }),
      0,
    );
    expect(model).toEqual({
      kind: "UNAVAILABLE",
      reason: "BOTH_DEGENERATE",
    });
  });

  it("Q OOD is unavailable", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      {
        status: "OUT_OF_DOMAIN",
        representation: ANALYSIS_QUERY_REPRESENTATION,
        provenance: STUB_PROVENANCE,
      },
      1,
    );
    expect(model).toEqual({ kind: "UNAVAILABLE", reason: "OUT_OF_DOMAIN" });
  });

  it("R COLUMN is unavailable", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      { status: "COLUMN_UNAVAILABLE" },
      1,
    );
    expect(model).toEqual({
      kind: "UNAVAILABLE",
      reason: "COLUMN_UNAVAILABLE",
    });
  });

  it("S does not mutate the supplied explanation", () => {
    const explanation = Object.freeze(supportedExplanation());
    if (
      explanation.status === "COLUMN_UNAVAILABLE" ||
      explanation.status === "OUT_OF_DOMAIN"
    ) {
      throw new Error("expected supported explanation");
    }
    const vorticity = explanation.worldHorizontalVorticity;
    const gradient = explanation.updraftHorizontalGradient;
    Object.freeze(vorticity);
    Object.freeze(gradient);
    const before = structuredClone(explanation);
    const model = createTrajectoryTiltingWhatIfModel(explanation, 0.9);
    expect(model.kind).toBe("AVAILABLE");
    expect(explanation).toEqual(before);
    expect(explanation.worldHorizontalVorticity).toBe(vorticity);
    expect(explanation.updraftHorizontalGradient).toBe(gradient);
    if (model.kind === "AVAILABLE") {
      expect(model.fixedOmegaVectorWorld).not.toBe(vorticity);
      expect(model.actualGradientVectorWorld).not.toBe(gradient);
    }
  });

  it("T world y component is 0", () => {
    const model = createTrajectoryTiltingWhatIfModel(
      supportedExplanation({ omegaX: 0.02, omegaZ: -0.01 }),
      1.1,
    );
    expect(model.kind).toBe("AVAILABLE");
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE");
    }
    expect(model.fixedOmegaVectorWorld.y).toBe(0);
    expect(model.actualGradientVectorWorld.y).toBe(0);
    expect(model.hypotheticalGradientVectorWorld.y).toBe(0);
  });

  it("rejects wrapped / out-of-range thetaWhatIf instead of wrapping", () => {
    const explanation = supportedExplanation();
    expect(() =>
      createTrajectoryTiltingWhatIfModel(explanation, (370 * Math.PI) / 180),
    ).toThrow(TrajectoryTiltingWhatIfError);
    expect(() => createTrajectoryTiltingWhatIfModel(explanation, -0.2)).toThrow(
      TrajectoryTiltingWhatIfError,
    );
  });

  it("initial theta is actual theta only when alignment is defined", () => {
    expect(initialThetaWhatIfFromActual(supportedExplanation())).toBe(
      Math.PI / 2,
    );
    expect(
      initialThetaWhatIfFromActual(
        supportedExplanation({ alignment: { state: "GRADIENT_DEGENERATE" } }),
      ),
    ).toBeUndefined();
    expect(
      initialThetaWhatIfFromActual({ status: "COLUMN_UNAVAILABLE" }),
    ).toBeUndefined();
  });

  it("has no React / Three / Analysis query / causal language", () => {
    expect(modelSrc).not.toMatch(/from ["']react/);
    expect(modelSrc).not.toMatch(/from ["']three/);
    expect(modelSrc).not.toMatch(/queryAnalysisTilting/);
    expect(modelSrc).not.toMatch(/queryAnalysisNativeSegmentVorticityAt/);
    expect(modelSrc).not.toMatch(/parcel/);
    expect(modelSrc).not.toMatch(/spin-up|spin-down/);
    expect(modelSrc).not.toMatch(/gained rotation|generated rotation/);
    expect(modelSrc).not.toMatch(/predict|future omega|delta omega/);
    expect(modelSrc).not.toMatch(/modify storm|update sounding/);
    expect(modelSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(modelSrc).not.toMatch(/ω_y,current|omega_y/);
  });
});
